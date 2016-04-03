"""
This file demonstrates writing tests using the unittest module. These will pass
when you run "manage.py test".

Replace this with more appropriate tests for your application.
"""

from django.test import TestCase
from .models import Questions,Options,Votes,Role
from django.core.exceptions import ValidationError


class QuestionsModelTest(TestCase):
	"""
	This class tests the Question model.
	"""

	def test_string_representation(self):
		question = Questions(question = 'How old are you')
		self.assertEqual(str(question),question.question)


	def test_minimum_question_length(self):
		"""
		Tests the minimum length of question
		"""
		qtn = 'x'*300
		question = Questions(question = qtn)
		question.save()
		self.assertGreater(Questions.objects.filter(question = qtn).count(),0)


class OptionsModelTest(TestCase):
	"""
	This class tests the Options model.
	"""

	def test_string_representation(self):
		option = Options(option = 'option1')
		self.assertEqual(str(option),option.option)


	def test_maximum_option_length(self):
		"""
		Tests maximum length of option
		"""
		opt = 'x'*60
		question = Questions.objects.create(question = 'How old are you')
		option = Options(option = opt,related_question = question)
		option.save()
		self.assertGreater(Options.objects.filter(option = opt).count(),0)
