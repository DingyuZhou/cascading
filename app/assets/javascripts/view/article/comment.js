View.Article.Comment = Backbone.View.extend({
  initialize: function(options) {
    this.articleId = options.articleId;
  },
  
  
  el: "div#article_comments_container",
  
  
  template: JST["template/article/comment"],
  
  
  render: function() {
    var that = this;
    
    var comments = new Collection.Article.Comment();
    comments.fetchForArticle(this.articleId, {
      success: function(fetchedComments) {
        console.log(fetchedComments);
        that.$el.html(that.template({comments: fetchedComments.models}));
      }
    });
  },
  
  
  events: {
    "click #save_comment": "saveComment",
    "click #cancel_comment": "cancelComment"
  },
  
  
  saveComment: function(event) {
    event.preventDefault();
    
    var that = this;
    
    var comment = new Model.Article.Comment();
    comment.save("comment", {
      content: $("#comment_input").val(),
      article_id: that.articleId,
      user_id: $.cookie("user_id"),
      user_nickname: $.cookie("user_nickname"),
      user_avatar_url: $.cookie("user_avatar_url")
    }, {
      success: function(savedComment) {
        Backbone.history.loadUrl();
      }
    });
  },
  
  
  cancelComment: function(event) {
    event.preventDefault();
    $("#comment_input").val("");
  }
});