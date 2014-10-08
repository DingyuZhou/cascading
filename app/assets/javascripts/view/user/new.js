View.User.New = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/user/new"],
  
  
  render: function() {
    this.$el.html(this.template());
  },
  
  
  events: {
    "click #new_user_save_button": "onSave",
    "click #new_user_cancel_button": "onCancel"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var that = this;
    
    var formData = new FormData();
    formData.append("user[email]", $("#new_user_email_input").val());
    formData.append("user[password]", $("#new_user_password_input").val());
    formData.append("user[nickname]", $("#new_user_nickname_input").val());
    formData.append("user[avatar]", $("#new_user_avatar_input").get(0).files[0]);
    formData.append("user[tier]", GlobalConstant.UserTier.FREE_USER);
    
    var user = new Model.User.User();
    
    user.save(formData, {
      success: function(savedUser) {
        that.signInHandler(null, null, true);
        Backbone.history.navigate("user/" + savedUser.id, {trigger: true});
      },
      
      error: function(jqXHR, textStatus, errorThrown) {},
      
      complete: function(jqXHR, textStatus ) {}
    });
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("", {trigger: true});
  }
});
