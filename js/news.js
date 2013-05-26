/* Angular News Application */

angular.module('clonkspotNewsApp', [])
  .constant('language', document.documentElement.lang)
  .constant('dpd', '/dpd')

  .factory('Authenticator', ['$rootScope', '$http', 'dpd', function($rootScope, $http, dpd) {
    var auth =  {
      // Check for authentication.
      check: function() {
        $http.get(dpd+'/users/me').success(function(result) {
          $rootScope.me = auth.me = result
        })
      },
      login: function(credentials) {
        $http.post(dpd+'/users/login', credentials)
          .success(function(result) {
            $rootScope.me = auth.me = result
          })
          .error(function(error) {
            alert('Could not log in: ' + error.message)
          })
      },
      logout: function() {
        $http.post(dpd+'/users/logout')
          .success(function() {
            $rootScope.me = auth.me = null
          })
          .error(function(error) {
            alert('Could not log out: ' + error.message)
          })
      }
    }
    return auth
  }])
  .run(['Authenticator', function(Authenticator) {
    Authenticator.check()
  }])
  .controller('NewsCtrl', ['$scope', '$http', 'Authenticator', 'language', 'dpd', function($scope, $http, Authenticator, lang, dpd) {
    // Load the news from the server.
    $http.get(dpd+'/news?' + JSON.stringify({lang: lang, $limit: 4, $sort: {date: -1}}))
      .success(function(news) {
        $scope.news = news
      })

    // Whether the admin view or the slider is shown.
    $scope.adminView = false

    $scope.login = {}

    // Login
    $scope.authenticate = Authenticator.login
    // Logout
    $scope.logout = Authenticator.logout

    // The item that is being edited.
    $scope.editItem = 1

    // Change above item.
    $scope.changeEditItem = function(to) {
      $scope.editItem = to
    }

    // Adds another news item on top.
    $scope.addItem = function() {
      var n = $scope.news.slice(0, 3)
      n.unshift({
        author: $scope.me.username,
        date: new Date().toISOString().slice(0, 10),
        lang: lang
      })
      $scope.news = n
    }

    // Save the edited news items on the server.
    $scope.updateNewsItems = function() {
      $scope.news.forEach(function(item, index) {
        $http.post(dpd+'/news', item)
          .success(function(result) {
            $scope.news[index] = result
          })
          .error(function(error) {
            alert('There was an error while saving: ' + error.message)
          })
      })
    }
  }])

  // Toggles a variable when pressing a certain key combination.
  .directive('keyToggle', function() {
    return function(scope, element, attrs) {
      var keys = attrs.keys.split('+'),
          toggle = attrs.keyToggle
      angular.element(document).bind('keydown', function(event) {
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].charCodeAt() != event.which && !event[keys[i].toLowerCase()+'Key']) {
            return;
          }
        }
        scope[toggle] = !scope[toggle]
        scope.$apply()
      })
    }
  })
