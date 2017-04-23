angular.module('link', ['ngRoute', 'ngSanitize'])
.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller:'LinkListController',
      templateUrl:'list.html',
    })
	.when('/param', {
      controller:'ParamListController',
      templateUrl:'param.html',
		
	})
	.when('/:tag', {
      controller:'LinkListController',
      templateUrl:'list.html',
	})
    .otherwise({
      redirectTo:'/'
	});
})
.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }    

    // Answer edited to include suggestions from comments
    // because previous version of code introduced browser-related errors

    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    $httpProvider.defaults.headers.get['Accept-Charset'] = undefined;
}])
.filter('trust', [
    '$sce',
    function($sce) {
      return function(value, type) {
        // Defaults to treating trusted text as `html`
        return $sce.trustAs(type || 'html', value);
      }
    }
])
.controller('ParamListController', ['$scope', '$window', function($scope, $window) {
		$scope.listTagRadios = $window.localStorage.getItem("listTag");
		if($scope.listTagRadios == null) {
			$scope.listTagRadios = 'right';
		}
		$scope.dropdownTagRadios = $window.localStorage.getItem("dropdownTag");
		if($scope.dropdownTagRadios == null) {
			$scope.dropdownTagRadios = 'display';
		}
		$scope.columnDescriptionRadios = $window.localStorage.getItem("descriptionColumn");
		if($scope.columnDescriptionRadios == null) {
			$scope.columnDescriptionRadios = 'none';
		}
		$scope.columnLiensRadios = $window.localStorage.getItem("liensColumn");
		if($scope.columnLiensRadios == null) {
			$scope.columnLiensRadios = 'none';
		}
		console.log($scope.listTagRadios);
		console.log($scope.dropdownTagRadios);
		console.log($scope.columnDescriptionRadios);
		console.log($scope.columnLiensRadios);
		
		$scope.saveToSession = function() {
			$window.localStorage.setItem("listTag", $scope.listTagRadios);
			$window.localStorage.setItem("dropdownTag", $scope.dropdownTagRadios);
			$window.localStorage.setItem("descriptionColumn", $scope.columnDescriptionRadios);
			$window.localStorage.setItem("liensColumn", $scope.columnLiensRadios);
		}
}])
.controller('LinkListController', ['$scope','$http', '$routeParams', '$sanitize', '$filter', '$window', function($scope, $http, $routeParams, $sanitize, $filter, $window) {
  // Load from localstorage
  $scope.listTagRadios = $window.localStorage.getItem("listTag");
  if($scope.listTagRadios == null) {
	$scope.listTagRadios = 'right';
  }
  $scope.dropdownTagRadios = $window.localStorage.getItem("dropdownTag");
  if($scope.dropdownTagRadios == null) {
	$scope.dropdownTagRadios = 'display';
  }
  $scope.columnDescriptionRadios = $window.localStorage.getItem("descriptionColumn");
  if($scope.columnDescriptionRadios == null) {
	$scope.columnDescriptionRadios = 'none';
  }
  $scope.columnLiensRadios = $window.localStorage.getItem("liensColumn");
  if($scope.columnLiensRadios == null) {
	$scope.columnLiensRadios = 'none';
  }
  
  var linksCSV=$http.get('links.csv',{headers : {'Content-Type' : 'text/csv; charset=iso-8859-1'}}).then(function(response) {
	$scope.links = [];
	$scope.nbTot = 0;
	$scope.tags = [];
	if(typeof $routeParams.tag !== 'undefined') {
		$scope.searchText = $routeParams.tag;
	} else {
		$scope.pasDeTag = 'active';
	}
    var allTextLines = [];
	//console.log(response.data);
	var data = $("<div>").html(response.data).text();
	console.log(data);
	allTextLines = data.split(/\r\n|\n/);
	console.log(allTextLines);
	for(i=0; i < allTextLines.length; i++) {
		line = allTextLines[i].split(";");
		link = {};
		link.name = line[0];
		line.shift();
		link.description = line[0];
		line.shift();
		link.href = line[0];
		line.shift();
		link.tags = [];
		for(j=0; j < line.length; j++) {
			if(line[j] != "") {
				tag={};
				for(k=0; k < $scope.tags.length; k++) {
					if($scope.tags[k].name == line[j]) {
						tag=$scope.tags[k];
						break;
					}
				}
				if(typeof tag.name !== 'undefined') {
					$scope.tags[k].nb = $scope.tags[k].nb + 1;
				} else {
					tag.name = line[j];
					tag.nb = 1;
					$scope.tags.push(tag);
				}
				link.tags.push(line[j]);
			}
		}
		$scope.nbTot = $scope.nbTot + 1;
		console.log(link);
		if(link.name != "") {
			$scope.links.push(link);
		}
	}
	console.log($scope.tags);
  });
  $scope.clearSearchText = function() {
	  $scope.searchText = "";
	  $scope.pasDeTag = 'active';
  }
  $scope.updateSearchText = function(new_text) {
	  $scope.searchText = new_text;
	  $scope.pasDeTag = 'inactive';
  }
  $scope.submitSearch = function() {
	  var result = $filter('filter')($scope.links, $scope.searchText);
	  if(result.length == 1) {
		  console.log(result);
	      $window.open(result[0].href, '_blank');
	  }
  }
  $("input[name='search']").focus();
}]);