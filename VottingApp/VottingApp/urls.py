from django.conf.urls import patterns, include, url

from tastypie.api import Api
from votting.api import UserResource, QuestionResource, VotesResource, OptionsResource, MyVotesResource

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

v1_api = Api(api_name='v1') #create Api object

#register classes from api.py
v1_api.register(UserResource())
v1_api.register(QuestionResource())
v1_api.register(VotesResource())
v1_api.register(OptionsResource())
v1_api.register(MyVotesResource())

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'VottingApp.views.home', name='home'),
    # url(r'^VottingApp/', include('VottingApp.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(v1_api.urls)),
)
