/* global angular */

/**
 * History Service 
 */
 angular.module('HistoryService', [])
	.factory('HistoryService', [
      '$state',
		function(
			$state
		)
		{
			return {
				
				_history : [],
				isTransitioningState : false,
				isEntry : true,
				
				/**
				 * Add an item to history
				 */
				add : function(entry) {
					// console.log('HistoryService length: ', this.length());
					if (this.length() > 0) {this.isEntry = false;}
					entry.params = $state.params;
					this._history.push(entry);
					this._updateIsEmpty();
					return this;
				},
				/**
				 * Return (or set) the last item in the history
				 */
				last : function(entry) {
					if (entry === undefined) {
						return this._history[this._history.length - 1];  
					} else {
						this._history[this._history.length] = entry;
						return this;
					}
				},
				/**
				 * Return (or set) the first item in the history
				 */
				first : function(entry) {
					if (entry === undefined) {
						return this._history[0];  
					} else {
						this._history[0] = entry;
						return this;
					}
				},
				/**
				 * Pop (return and remove last item)
				 */
				pop : function() {
				  var result = this._history.pop();
				  this._updateIsEmpty();
				  return result;
				},
				/**
				 * Shift (return and remove first item)
				 */
				shift : function() {
				  var result = this._history.shift();
				  this._updateIsEmpty();
				  return result;
				},
				/**
				 * Slice (facade for this._history array)
				 */
				 slice : function() {
				   var result = this._history.slice(arguments);
				   this._updateIsEmpty();
			     return result;
				 },
				/**
				 * Does the history contain this item?
				 */
				contains : function(entries) {
					if (entries.constructor !== Array) {entries = [entries];}
					for (var key in entries) {
						if (this._history.indexOf(entries[key]) !== -1) {
							return true;	
						}
					}
					return false;
				},
				containsByName : function(names) {
					if (names.constructor !== Array) {names = [names];}
					for (var key in this._history) {
						var historyItem = this._history[key];
						if (names.indexOf(historyItem.name) !== -1) { return true; }
					}
					return false;
				},
				/**
				 * How many of this item are contained in history?
				 */
				containsCount : function(entries) {
					if (entries.constructor !== Array) {entries = [entries];}
					var count = 0;
					for (var key in this._history) {
						var historyItem = this._history[key];
						if (entries.indexOf(historyItem) !== -1) { count++; }
					}
					return count;
				},
				containsCountByName : function(names) {
					if (names.constructor !== Array) {names = [names];}
					var count = 0;
					for (var key in this._history) {
						var historyItem = this._history[key];
						if (names.indexOf(historyItem.name) !== -1) { count++; }
					}
					return count;
				},
				
				/**
				 * Get previous states
				 */
				get : function()
				{
				  return this._history;
				},
				getPreviousByName: function(names)
				{
					if (names.constructor !== Array) { names = [names]; }
					
					for (var i = this._history.length - 1; i >= 0; i--)
					{
						var thePreviousState = this._history[i];
						if (names.indexOf(thePreviousState.name) !== -1) {return thePreviousState}
					}
					return null;
				},

				/**
				 * Clear the history
				 */
				clear : function() {
					this._history = [];
					this._updateIsEmpty();
					return this;
				},
				/**
				 * History length
				 */
				length : function() {
				  return this._history.length;
				},
				
				isEmpty : true,
				_updateIsEmpty : function() {
				  this.isEmpty = (
  				      this._history.length === null
  				   || this._history.length === undefined
  				   || this._history.length < 2
			    );
				},
				
				/**
				 * Navigation helpers
				 */
				goToLast : function(params, options) 
				{
				  if (this.last() === undefined) { return false; }
				  if (params   === undefined) { params  = {}; }
				  if (options  === undefined) { options = {}; }
				  this.isTransitioningState = true;
				  return $state.go(
				    this.last().name,
				    params,
				    options
			    ).then(function() { this.isTransitioningState = false; }.bind(this))
				},
				goToFirst : function(params, options) 
				{
				  if (this.first() === undefined) { return false; }
				  if (params   === undefined) { params  = {}; }
				  if (options  === undefined) { options = {}; }
				  this.isTransitioningState = true;
			    return $state.go(
			      this.first().name,
			      params,
			      options
		      ).then(function() { this.isTransitioningState = false; }.bind(this));  
				},
				goBack : function(params, options) 
				{
				  if (this.length() < 2) { return false; }
				  this.pop();
				  if (params   === undefined) { params  = {}; }
				  if (options  === undefined) { options = {}; }
			    this.goToLast();
				}
				
			};
			
		}
	])
;
		