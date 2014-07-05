// define the view "Index"
Articles.Views.Index = Backbone.View.extend({
  el: 'body',
  
  template: JST["articles/templates/index"],
  
  render: function() {
    var that = this;
    
    var articles = new Articles.Collection();
    articles.fetch({
      success: function(articles) {
        $(function() {
          that.$el.html(that.template({articles: articles.models}));
        }); 
      }
    });
    
    return this;
  }
});
