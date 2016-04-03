// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    controller: 'TabsCtrl',
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:


  //first load homepage
  .state('homepage', {
        url: '/home',
        templateUrl: 'templates/homepage.html',
        controller: 'HomeCtrl'
    })


  //load login page
  .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })


  //load all questions for admin user
  .state('tab.dash', {
      url: '/dash',
      views: {
          'tab-dash': {
              templateUrl: 'templates/tab-dash.html',
              controller: 'DashCtrl'
          }
      }
    })


  //load page for adding new question by admin user
  .state('tab.newquestion', {
      url: '/newquestion',
      views: {
        'tab-newquestion': {
          templateUrl: 'templates/tab-new_question.html',
          controller: 'NewQtnCtrl'
        }
      }
    })


  //load questions to vote for normal user
  .state('tab.questions', {
      url: '/questions',
      views: {
        'tab-questions': {
          templateUrl: 'templates/tab-questions.html',
          controller: 'QtnsCtrl'
        }
      }
    })


  //load selected question for voting
  .state('tab.vote', {
        url: '/vote/:qtnId',
        views: {
            'tab-questions': {
                templateUrl: 'templates/vote.html',
                controller: 'VotingCtrl'
            }
        }
    })

  //load current users voted questions
  .state('tab.myvotes', {
        url: '/myvotes',
        views: {
            'tab-myvotes': {
                templateUrl: 'templates/myvote.html',
                controller: 'MyVoteCtrl'
            }
        }
    })

  //logout user
  .state('tab.logout', {
        url: '/logout',
        views: {
            'tab-logout': {
                controller: 'LogoutCtrl'
            }
        }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise(function($injector, $location) {
        var $state = $injector.get("$state");
        $state.go('login');
    });

});
