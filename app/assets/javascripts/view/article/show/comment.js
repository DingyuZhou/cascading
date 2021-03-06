View.Article.Show.Comment = Backbone.View.extend({
  initialize: function(options) {
    this.articleId = options.articleId;
  },
  
  
  el: "div#article_comments_container",
  
  
  template: JST["template/article/show/comment/main"],
  singleCommentTemplate: JST["template/article/show/comment/single_comment"],
  
  
  render: function() {
    var that = this;
    
    var comments = new Collection.ArticleComment.All();
    comments.fetchForArticle(this.articleId, {
      success: function(fetchedComments) {
        that.$el.html(that.template({comments: fetchedComments.models, singleCommentTemplate: that.singleCommentTemplate}));
        that.commentList = $("#article-show-comment-list");
      }
    });
  },
  
  
  events: {
    "click #m-comment-save": "saveComment",
    "click #m-comment-cancel": "cancelComment"
  },
  
  
  saveComment: function(event) {
    event.preventDefault();
    
    var that = this;
    
    var comment = new Model.Comment();
    comment.save("comment", {
      content: $("#article-show-comment-draft").val(),
      article_id: that.articleId,
      user_id: $.cookie("user_id"),
      user_nickname: $.cookie("user_nickname"),
      user_avatar_url: $.cookie("user_avatar_url")
    }, {
      success: function(savedComment) {
        that.commentList.prepend(that.singleCommentTemplate({comment: savedComment}));
        $("#article-show-comment-draft").val("");
      }
    });
  },
  
  
  cancelComment: function(event) {
    event.preventDefault();
    $("#article-show-comment-draft").val("");
  }
});
