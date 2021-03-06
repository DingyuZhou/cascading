// define the view Search
View.Article.Search = Backbone.View.extend({
  initialize: function(options) {
    this.keyword = options.keyword;
    
    _.bindAll(this, "fetchFunction");
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/search"],


  render: function() {
    this.$el.html(this.template({keyword: this.keyword}));
    
    this.viewArticleCascade = new View.Article.CoverCascade({
      fetchFunction: this.fetchFunction,
      coverDisplayType: GlobalConstant.Article.CoverDisplayType.SEARCH_RESULT
    });
    this.viewArticleCascade.render();

    return this;
  },


  fetchFunction: function(fetchSequenceNumber, articlesPerFetch, fetchOptions, callbacks) {
    var articles = new Collection.Article.Search({
      keyword: this.keyword,
      fetchSequenceNumber: fetchSequenceNumber,
      articlesPerFetch: articlesPerFetch,
      pageLoadTime: fetchOptions.pageLoadTime
    });
    articles.fetch(callbacks);
  },


  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
