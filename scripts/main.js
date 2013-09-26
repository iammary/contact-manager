(function ($, BB, _) {

	$('#add_contact').tooltip();

	var App = Backbone.View.extend({
		el: "#contacts",
		events: {
			'click #add_contact': 'addPerson'
		},
		initialize: function () {
			this.input_name = $('#inputs input[name=fullname]');
			this.input_number = $('#inputs input[name=number]');
			this.input_username = $('#inputs input[name=username]');
			this.contacts_list = $('.table tbody tr:last-child');
			this.fields = $("input[type='text']");

			this.listenTo(this.collection,'add', this.createView);
			this.listenTo(this.collection,'destroy', this.resetView);
			this.collection.fetch();
		},
		addPerson: function (evt) {
			_this = this;
			var person = new PersonModel({
				name: _this.input_name.val(),
				number: _this.input_number.val(),
				username: _this.input_username.val()
			});
			
			person.save(null, {
				success: function(model, resp, options) {
					_this.collection.add(model);
				},
				error: function(model, xhr, options) {
					alert('Error in saving.');
					clearField(_this.input_username, true);
				}
			})
		},

		createView: function(model) {
			position = this.collection.indexOf(model) + 1;
			model.set("num", position);
			var view = new PersonView({model: model});
			this.contacts_list.before(view.render().el);
			clearField(this.fields, false);
		},

		resetView: function(model) {
			deletedPosition = model.attributes.num;
			while(deletedPosition<=this.collection.models.length) {
				var backpos = deletedPosition - 1;
				this.collection.at(backpos).set({num: deletedPosition});
				$(".table tr:nth-child("+backpos+") td").first().text(deletedPosition-1);
				deletedPosition++;
			}
			var test = deletedPosition - 1;
			$(".table tr:nth-child("+test+") td").first().text(deletedPosition-1);
		}
	});

	function clearField(fields, clear) {
		fields.val('');
		clear ? fields.toggleClass('focus') : fields.removeClass('focus');
	}

	var PersonModel = Backbone.Model.extend({
		idAttribute: '_id',
		url: function() {
			var location = "http://localhost:9090/contacts";
			return this.id ? (location + '/' + this.id) : location;
		},
		defaults: {
			'name': '-',
			'number': '-',
			'username': '-'
		},
		initialize: function () {
			
		}
		
	});

	var PersonCollection = Backbone.Collection.extend({
		model: PersonModel,
		comparator: 'num',
		url: 'http://localhost:9090/contacts',
		initialize: function () {

		}
	});

	var PersonView = Backbone.View.extend({
		tagName: 'tr',
		template: $('#contact_template').html(),
		edit_template: $('#edit_mode_template').html(),
		events: {
			'click .delete': 'deletePerson',
			'click .edit': 'editPerson',
			'click .done': 'savePerson',
			'click .cancel': 'viewUpdate'
		},
		initialize: function() {
			// Triggers after a model is deleted in the database
			this.listenTo(this.model, 'destroy', this.removeView);
			// Triggers after a model's field changed or updated in the database
			this.listenTo(this.model, 'change', this.viewUpdate);
		},

		deletePerson: function(evt) {
			this.model.destroy({
				wait: true,
				success: function(model, resp, opt) {
					console.log('model destroy success: ', model);
				},
				error: function (model, xhr, opt) {
					console.log('model destroy error: ', model);
				}
			})



			// var pos = parseInt($(evt.target).parents('tr').find('.position').text());
			// var deleteContact = this.collection.findWhere({num: pos});
			// deleteContact.destroy();
			// $(evt.target).parents('tr').remove();
			// while(deletedPosition<=this.collection.models.length) {
			// 	var backpos = deletedPosition - 1;
			// 	this.collection.at(backpos).set({num: pos});
			// 	$(".table tr:nth-child("+backpos+") td").first().text(deletedPosition-1);
			// 	pos++;
			// }
			// var test = pos -1;
			// $(".table tr:nth-child("+test+") td").first().text(deletedPosition-1);

		},

		removeView: function() {
			this.undelegateEvents();
			this.stopListening();
			this.remove();
		},

		editPerson: function() {
			var compiledTemplate = _.template(this.edit_template);
			position = this.model.attributes.num;
			this.$el.html(compiledTemplate(this.model.toJSON()))
			this.$el.addClass('highlight');
		},

		savePerson: function(evt) {

			var newAttrs = {
				name: this.$el.find('input[name=fullname]').val(),
				number: this.$el.find('input[name=number]').val(),
				username: this.$el.find('input[name=username]').val()
			}

			if (!this.attrChanged(newAttrs)) {
				this.viewUpdate();
			} else {
				this.model.save(newAttrs, {
					wait: true,
					success: function (model, resp, opt) {
						console.log('model update success: ', model);
					},
					error: function (model, xhr, opt) {
						console.log('model update error: ', model);
						alert('Error on saving');
						clearField($('.highlight input[name=username]'), true);
					}
				});
			}
			
		},

		viewUpdate: function() {
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()));
			this.$el.removeClass('highlight');
		},

		render: function() {
			var compiledTemplate = _.template(this.template);
			this.$el.html(compiledTemplate(this.model.toJSON()))
			return this;
		},

		attrChanged: function (newAttr) {
			validKeys = ['name', 'number', 'username'];
			var changed = _.isEqual(_.pick(this.model.attributes, validKeys), newAttr);
			return !changed;
		}
	});


	var contactApp = new App({collection: new PersonCollection()});



})(jQuery, Backbone, _)