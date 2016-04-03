from tastypie.resources import ModelResource
from votting.models import Questions,Options,Votes,Role
from django.contrib.auth.models import User
from django.conf.urls import url
from tastypie.utils import trailing_slash
from django.contrib.auth import authenticate, login, logout
from tastypie.authentication import ApiKeyAuthentication
from tastypie.authorization import Authorization
from tastypie.models import ApiKey
from django.db import connection,transaction
from django.db.models import Count,Q
import json
import json as simplejson
from django.core import serializers


class UserResource(ModelResource):
	"""
	A class that acts as API resource for login and logout operations.
	This class handles authentication, login and logout operations.
	Two types of user.Admin user and normal user.
	"""
	class Meta:
		queryset = User.objects.all()
		fields = ['first_name', 'last_name', 'email']
		allowed_methods = ['get', 'post']
		resource_name = 'user'


	def prepend_urls(self):
		return [
			url(r"^(?P<resource_name>%s)/login%s$" %
				(self._meta.resource_name, trailing_slash()),self.wrap_view('login'), name="api_login"),
			url(r'^(?P<resource_name>%s)/logout%s$' %
				(self._meta.resource_name, trailing_slash()),self.wrap_view('logout'), name='api_logout'),
		]


	def login(self, request, **kwargs):
		"""
		Authenticates and login user request.
		Takes user credentials from request and authenticates and then tries to login the user.
		Returns success=True,username,api key and role if the user is authendicated.
		Returns success=False if user is not authenticated.
		"""
		self.method_check(request, allowed=['post'])
		username = request.POST.get('username', '').lower()
		password = request.POST.get('password', '')
		user = authenticate(username=username, password=password)
		if user:
			login(request, user)
		else:
			return self.create_response(request, {
				'success': False,
				'reason': 'incorrect',
				}, HttpForbidden)
		role = Role.objects.get(user = user).role_name
		return self.create_response(request, {
			'success': True,
			'profile': user.username,
			'api_key': ApiKey.objects.get(user = request.user).key,
			'role': role
		})


	def logout(self, request, **kwargs):
		"""
		Function to handle logout.
		Returns success=True if successfully logged out else returns success=False
		"""
		self.method_check(request, allowed=['get'])
		if request.user and request.user.is_authenticated():
			logout(request)
			return self.create_response(request, { 'success': True })
		else:
			return self.create_response(request, { 'success': False }, HttpUnauthorized)



class QuestionResource(ModelResource):
	"""
	Class to handle Question and options creation and Questions retrievel.
	Admin user can create and retrieve questions and retrieve votings for particular question.
	Normal user can retrieve questions those he did not vote for.
	"""

	class Meta:
		queryset = Questions.objects.all()
		resource_name = 'questionresource'
		allowed_methods = ['post','get']
		max_limit = None
		authorization = Authorization()
		authentication = ApiKeyAuthentication()

	#function to create question and options
	def obj_create(self,bundle,request=None, **kwargs):
		"""
		Creates questions and options submitted by authenticated user.
		"""
		qtn_obj = Questions.objects.create(question = bundle.data['question'],created_by = bundle.request.user)
		del bundle.data['question']
		query = "INSERT INTO votting_options (option,related_question_id) VALUES "+\
					','.join(
								map(
									lambda x:"('"+str(x[0])+"','"+str(x[1])+"')",
									[(bundle.data[i],qtn_obj.id) for i in bundle.data]
									)
							)+';'##creates query - INSERT INTO table (field1,field2) VALUES (option1,question),
								 ##(option2,question),(option3,question),(option4,question);
		cursor = connection.cursor()
		cursor.execute(query)
		transaction.commit()
		return

	def get_object_list(self, request, **kwargs):
		"""
		Retrieves Questions based on type of user.
		If requested user is Admin user this function returns all questions.
		If requested user is normal user it returns questions those he has not voted for.
		"""
		role = Role.objects.get(user = request.user).role_name
		if role == 1:
			objects = Questions.objects.all()
		else:
			objects = Questions.objects.filter(~Q(votes__user = request.user))
		return objects

#class voted resources
class VotesResource(ModelResource):
	"""
	Class serves as resource for votes.
	Creates Voting model entries and retrieves options for question.
	"""
	class Meta:
		queryset = Votes.objects.all()
		resource_name = 'votesresource'
		allowed_methods = ['post','get']
		authorization = Authorization()
		authentication = ApiKeyAuthentication()

	def post_list(self, request, **kwargs):
		"""
		Identifies user from request.
		Returns votes for a particular question if requested user is admin user.
		Returns options for a particular question request by user if user is a normal user.
		"""
		role = Role.objects.get(user = request.user).role_name
		if role == 1:
			qtn_id = request.POST.get('qtn_id')
			d = {}
			votes = Votes.objects.filter(question__id = qtn_id).values('option__option').\
					annotate(count = Count('option__option'))
			for i in votes:
				d[i['option__option']] = i['count']
			return self.create_response(request, d)
		else:
			qtn_id = request.POST.get('qtn_id')
			optn_id = request.POST.get('option_id')
			qtn_obj = Questions.objects.get(id = qtn_id)
			optn_obj = Options.objects.get(id = optn_id)
			Votes.objects.create(question = qtn_obj, option = optn_obj, user = request.user)
		


class OptionsResource(ModelResource):
	"""
	Class serves as resource for options model.
	Retrieves question and options for curresponding question.
	"""

	class Meta:
		queryset = Options.objects.all()
		resource_name = 'optionsresource'
		allowed_methods = ['post','get']
		authorization = Authorization()
		authentication = ApiKeyAuthentication()

	#function to create question and options
	def post_list(self, request, **kwargs):
		"""
		Takes question id from request.
		Returns Question and options based on the question id.
		"""
		d = {}
		d['question'] = Questions.objects.filter(id = request.POST.get('qtn_id')).values_list('id','question')[0]
		for i,item in enumerate(Options.objects.filter(related_question__id = request.POST.get('qtn_id'))):
			d[i] = [item.id,item.option]
		return self.create_response(request, d)
 

class MyVotesResource(ModelResource):
	"""
	Class acts as resource for Questions voted by a particular user.
	"""


	class Meta:
		queryset = Questions.objects.all()
		resource_name = 'myvotesresource'
		allowed_methods = ['post','get']
		authorization = Authorization()
		authentication = ApiKeyAuthentication()

	def get_object_list(self, request, **kwargs):
		"""
		Returns Questions voted by a particular user.
		identifies user from request.
		"""
		objects = Questions.objects.filter(votes__user = request.user)
		return objects

	def post_list(self, request, **kwargs):
		"""
		Returns all options and voted option for a particular question.
		"""
		d = {}
		voted_option = Votes.objects.filter(question__id = request.POST.get('qtn_id'),user = request.user)[0]
		d['voted_option'] = voted_option.option.option
		for i,item in enumerate(Options.objects.filter(related_question__id = request.POST.get('qtn_id'))):
			d[i] = item.option
		return self.create_response(request, d)
   
 
