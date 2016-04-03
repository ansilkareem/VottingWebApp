angular.module('starter.controllers', [])

//code block for admin user
.controller('TabsCtrl', function($scope, TabsService) {

  $scope.showDash = TabsService.showDash();
  $scope.showNew = TabsService.showNew();
  $scope.showQuestions = TabsService.showQuestions();
  $scope.showVote = TabsService.showVote();
  $scope.showLogout = TabsService.showLogout();

})

//controller for dashboard
.controller('DashCtrl', function($scope, $http, AuthService, $ionicPopup, $httpParamSerializerJQLike, $ionicModal, HttpRequestService) {

  //all declarations
  $scope.questions = []
  $scope.title = ''
  d = ''
  //modal declaration
  $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

  HttpRequestService.getRequest('questionresource').then(function(d) {
    if(d.status == 'success'){
      $scope.questions = d.response
    }
    else{
      var alertPopup = $ionicPopup.alert({
           title: 'something went wrong, please try again',
        });
    }
  });


  //function get votes for corresponding question
  $scope.getVotings = function(qtn_id){
    data = $httpParamSerializerJQLike({
      'qtn_id':qtn_id.id
    })
    
    HttpRequestService.postRequest('votesresource',data,true).then(function(d) {
      if(d.status == 'success'){
        $scope.result = d.response
        $scope.title = qtn_id.question
        console.log('result',$scope.result)
        $scope.modal.show()
      }
      else{
        var alertPopup = $ionicPopup.alert({
             title: 'something went wrong, please try again',
          });
      }
    });
  }
})


//controller for creating new question
.controller('NewQtnCtrl', function($scope, $http, AuthService, $ionicPopup, HttpRequestService, $httpParamSerializerJQLike) {

  $scope.formData = {}

  //function post question and options to server
  $scope.create_question = function(){

    data = {};
    data['question'] = $scope.formData.question;
    data['option1'] = $scope.formData.option_1;
    data['option2'] = $scope.formData.option_2;
    data['option3'] = $scope.formData.option_3;
    data['option4'] = $scope.formData.option_4;

    HttpRequestService.postRequest('questionresource',data).then(function(d) {
      if(d.status == 'success'){
        var alertPopup = $ionicPopup.alert({
                              title: 'Question Created Successfully',
                          }).then(function(res) {
                                window.location.reload(true)
                          });
      }
      else{
        var alertPopup = $ionicPopup.alert({
             title: 'something went wrong, please try again',
          });
      }
    });
  }

  

})


//controller for home page
.controller('HomeCtrl', function($scope, $state, $ionicPopup, $http, $ionicViewSwitcher) {
    
    user_type = window.localStorage['user_type']

    if(user_type == 1){
      $state.go('tab.dash', {}, {
            reload: true
        });
    }
    else{
      $state.go('tab.questions', {}, {
            reload: true
        });
    }
    
})


//controller for login
.controller('LoginCtrl', function($scope, $state, AuthService, $ionicPopup, $ionicViewSwitcher, $ionicHistory) {

    $scope.$on('$ionicView.enter', function() {
      if( $ionicHistory.backView() != null ){
        if( $ionicHistory.backView()['stateId'] == 'tab.logout' ){
          window.location.reload(true)
        }   
      }
      
    });
    
    $scope.data = {};
    $scope.vale = ''
    $scope.$on('$ionicView.enter', function() {
        $scope.vale = "Login";
    });
    $scope.login = function(data) {
        $scope.vale = "Loging in..."
        AuthService.login(data.username, data.password).then(function(authenticated) {
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('homepage', {}, {
                reload: true
            });
        }, function(err) {
            $scope.vale = "Login";
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Invalid User Credentials'
            });
        });
    };
})
//end code block for admin user

//code block for normal user

.controller('QtnsCtrl', function($scope, $state, AuthService, $ionicPopup, $ionicViewSwitcher, $http, HttpRequestService) {

    $scope.$on('$ionicView.enter', function() {
        $scope.questions = []
        HttpRequestService.getRequest('questionresource').then(function(d) {
          if(d.status == 'success'){
            $scope.questions = d.response
          }
          else{
            var alertPopup = $ionicPopup.alert({
                 title: 'something went wrong, please try again',
              });
          }
        });
    });

    
    
})

.controller('VotingCtrl', function($scope, $state, AuthService, $http, $stateParams, $httpParamSerializerJQLike, $ionicPopup, HttpRequestService) {

    $scope.question = ''
    $scope.questionid = ''
    $scope.options = ''
    $scope.optionId = ''
    data = $httpParamSerializerJQLike({
      'qtn_id':$stateParams.qtnId
    })
    HttpRequestService.postRequest('optionsresource',data,true).then(function(d) {
      if(d.status == 'success'){
        $scope.question = d.response['question'][1]
        $scope.questionid = d.response['question'][0]
        delete d.response['question']
        $scope.options = d.response
      }
      else{
        var alertPopup = $ionicPopup.alert({
             title: 'something went wrong, please try again',
          });
      }
    });

    //function to save option id
    $scope.saveOptionId = function(option_id){
      $scope.optionId = option_id
    }

    $scope.submitVote = function(){
      if($scope.optionId != ''){

        //submit vote
        data = $httpParamSerializerJQLike({
          'qtn_id':$scope.questionid,
          'option_id':$scope.optionId
        })
        HttpRequestService.postRequest('votesresource',data,true).then(function(d) {
          if(d.status == 'success'){
             var alertPopup = $ionicPopup.alert({
                                  title: 'Your option submitted successfully',
                              }).then(function(res) {
                                  $state.go('tab.questions');
                                });
          }
          else{
            var alertPopup = $ionicPopup.alert({
                 title: 'something went wrong, please try again',
              });
          }
        });
      }
    }
})


.controller('MyVoteCtrl', function($scope, $state, AuthService, $http, $stateParams, $httpParamSerializerJQLike, $ionicPopup, $ionicModal, HttpRequestService) {

    $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });

    $scope.questions = ''
    $scope.options = ''
    $scope.voted_option = ''

    $scope.$on('$ionicView.enter', function() {
      HttpRequestService.getRequest('myvotesresource').then(function(d) {
        if(d.status == 'success'){
          $scope.questions = d.response
        }
        else{
          var alertPopup = $ionicPopup.alert({
               title: 'something went wrong, please try again',
            });
        }
      });
    })

    $scope.showModal = function(qtn){
      $scope.title = qtn.question

      //get all the corressponding options
      data = $httpParamSerializerJQLike({
          'qtn_id':qtn.id,
        })
      HttpRequestService.postRequest('myvotesresource',data,true).then(function(d) {
        if(d.status == 'success'){
          $scope.voted_option = d.response['voted_option']
          delete d.response['voted_option']
          $scope.options = d.response
          $scope.modal.show()
        }
        else{
          var alertPopup = $ionicPopup.alert({
               title: 'something went wrong, please try again',
            });
        }
      });
    }
})
//end code block for normal user

.controller('LogoutCtrl', function($scope, $state) {
  
  $state.go('login', {}, {
            reload: false
        });
})





