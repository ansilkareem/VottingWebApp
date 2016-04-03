from django.db import models
from django.contrib.auth.models import User
from datetime import datetime as dt
from tastypie.models import create_api_key
# Create your models here.


#signal for apikey generation
models.signals.post_save.connect(create_api_key, sender=User)

class Questions(models.Model):
	"""
	Class for question model.
	All questions are saved in this model.
	"""
	question = models.CharField(max_length = 500)
	created_by = models.ForeignKey(User,null = True,blank= True)\

	def __str__(self):
		return self.question

class Options(models.Model):
	"""
	Class for options for questions.
	All options for a particular question are saved in this model.
	"""
	option = models.CharField(max_length = 60)
	related_question = models.ForeignKey(Questions)

	def __str__(self):
		return self.option


class Votes(models.Model):
	"""
	Class for Votes for questions.
	All votes for a particular question is saved in this model.
	"""
	question = models.ForeignKey(Questions)
	option = models.ForeignKey(Options)
	user = models.ForeignKey(User)
	voted_date = models.DateTimeField(default = dt.now())


ROLE_CHOICES = (
		(1,'Admin'),
		(2,'Voter')
	)

class Role(models.Model):
	"""
	Class for role for users.
	Each user can have either an admin role or a normal user role.
	"""
	role_name = models.IntegerField(choices = ROLE_CHOICES)
	user = models.OneToOneField(User)
