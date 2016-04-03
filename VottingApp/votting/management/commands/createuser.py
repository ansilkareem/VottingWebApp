"""
This file demonstrates creating management command for creating user.
Executed by running "management.py createuser username role".
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from votting.models import Role


class Command(BaseCommand):
    """
        Class for creating user using management command
    """

    help = 'Create user from command line'

    def handle(self, *args, **options):
        """
        Takes username,password and role from command line.
        Creates user using the inputs.
        User is create according to role.
        A user can have either Admin role or Normal User role.
        """
    	username = raw_input('Username : ')
    	password = raw_input('Password : ')
    	role = input('Role (1 for admin and 2 for normal user): ')
    	roles = [1,2]
    	if role not in roles:
    		self.stdout.write("\nRole Must be 1 or 2\n")
    	else:
    		try:
    			user = User.objects.create_user(username = username, password = password)
    			Role.objects.create(role_name = role, user = user)
    			self.stdout.write('\nUser created successfully')
    		except Exception as ex:
    			self.stdout.write('\nUser name already exists.Please enter another one\n')

