angular.module('starter.services', [])


.service('AuthService', function($q, $http, $httpParamSerializerJQLike, $state) {

    // initialization

    var API_KEY = '';
    var username = '';
    var isAuthenticated = false;
    var role = '';

    // login

    var login = function(name, pw) {
        return $q(function(resolve, reject) {
            $http({
                    method: 'POST',
                    url: 'http://localhost:8000/api/v1/user/login/',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: $httpParamSerializerJQLike({
                        'username': name,
                        'password': pw,
                    })
                })
                .then(function(response) {

                        window.localStorage['apiKey'] = response.data.api_key
                        window.localStorage['username'] = response.data.profile
                        window.localStorage['user_type'] = response.data.role
                        resolve('Login success.');
                    },
                    function(response) {
                        reject('Login Failed.');
                    })
        });
    };


    // logout

    var logout = function() {
        destroyUserCredentials();
    };


    return {
        login: login,
        logout: logout,
        apiKey: API_KEY,
        isAuthenticated: function() {
            return isAuthenticated;
        },
        username: function() {
            return window.localStorage['username'];
        },
        apiKey: function() {
            return window.localStorage['apiKey'];
        },
        header: function(){
          return 'Authorization: ApiKey '+window.localStorage['username']+':'+window.localStorage['apiKey'];
        }
    };
})


.service('TabsService', function($q) {


    return {
        showDash: function() {
          if(window.localStorage['user_type'] == 1){
            return true;
          }
          else{
            return false;
          }
        },
        showNew: function() {
          if(window.localStorage['user_type'] == 1){
            return true;
          }
          else{
            return false;
          }
        },
        showQuestions: function() {
          if(window.localStorage['user_type'] == 2){
            return true;
          }
          else{
            return false;
          }
        },
        showVote: function(){
          if(window.localStorage['user_type'] == 2){
            return true;
          }
          else{
            return false;
          }
        },
        showLogout: function(){
          return true;
        }
    };
})


.factory('HttpRequestService', function($q, $timeout, $http, AuthService) {
  //factory for http get and post request
  //returns response data from request

  return {
    postRequest: function(resource, post_data=false, header=false) {
      //function for post request

      apiKeyAuth = 'username='+AuthService.username()+'&api_key='+AuthService.apiKey()
      if (header){
        headers = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
      }
      else{
        headers = {}
      }
      return $http({
                  method: 'POST',
                  url: 'http://localhost:8000/api/v1/'+resource+'/?'+apiKeyAuth,
                  data: post_data,
                  headers: headers,
                }).then(function successCallback(response) {
                    
                    result = {}
                    result['status'] = 'success'
                    result['response'] = response.data
                    return result

                  }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.

                    result = {}
                    result['status'] = 'error'
                    return result

                  });
    },
    getRequest: function(resource){
        //function for get request

        apiKeyAuth = 'username='+AuthService.username()+'&api_key='+AuthService.apiKey()
        return $http({
                      method: 'GET',
                      url: 'http://localhost:8000/api/v1/'+resource+'/?'+apiKeyAuth
                    }).then(function successCallback(response) {
                        
                        result = {}
                        result['status'] = 'success'
                        result['response'] = response.data.objects
                        return result

                      }, function errorCallback(response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.

                        result = {}
                        result['status'] = 'error'
                        return result

                      });
    }
  };
})
