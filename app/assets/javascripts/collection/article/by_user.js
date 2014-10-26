Collection.Article.ByUser = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/byUser/?" + $.param({batch: this.batch, articles_per_batch: this.articlesPerBatch, user_id: this.userId});
  },
  
  
  fetchBatch: function(batch, articlesPerBatch, options) {
    this.batch = batch;
    this.articlesPerBatch = articlesPerBatch;
    
    this.fetch(options);
  }
});