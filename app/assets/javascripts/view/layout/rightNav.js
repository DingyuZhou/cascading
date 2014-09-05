View.Layout.RightNav = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
    this.signOutHandler = options.signOutHandler;
  },
  
  
  tagName: "div",
  className: "container",
  
  
  template: JST["template/layout/rightNav"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click #layout-rightNav-form-submit": "onSignIn",
    "click #layout-rightNav-signOut": "onSignOut"
  },
  
  
  onSignIn: function(event) {
    event.preventDefault();
    
    var email = $("#layout-rightNav-form-email").val();
    var password = $("#layout-rightNav-form-password").val();    
    this.signInHandler(email, password);
  },
  
  
  onSignOut: function(event) {
    event.preventDefault();
   
    this.signOutHandler();
  }
});
