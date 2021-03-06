// define a cascade view for article covers
View.Article.Show.Recommend = View.Cascade.Base.extend({
  ITEM_COUNT_PER_FETCH: 10,
  ITEM_COUNT_PER_DISPLAY_BATCH: 1,

  BATCH_EAGER_DISPLAY_ABOVE_VIEWPORT: 0,
  BATCH_EAGER_DISPLAY_BELOW_VIEWPORT: 0,
  
  AUTO_FETCH_WHEN_SCROLL_TO_BOTTOM: false,
  
  ADJUST_CASCADE_WHEN_VIEWPORT_WIDTH_CHANGE: false,
  
  MAX_COLUMN_COUNT: 1,
  ENABLE_COMPACT_MODE: false,
  
  NORMAL_COLUMN_WIDTH: 200.0,   // in the unit "px"
  NORMAL_VERTICAL_GAP: 0,   // in the unit "px"
  NORMAL_HORIZONTAL_GAP: 8.0,   // in the unit "px"
 
  
  initializeOtherConstants: function() {
    this.ITEM_PICTURE_WIDTH = 200.0;   // in the unit "px"
    this.REGULAR_RECOMMEND_COUNT = 4;
  },
  
  
  el: "#article-show-recommend-cascade",
    
  mainTemplate: JST["template/article/show/recommend/cascade_main"],   // override cascade base class
  itemTemplate: JST["template/article/show/recommend/cascade_item"],   // override cascade base class
  regularRecommendTemplate: JST["template/article/show/recommend/regular"],
  
  
  initializeHelper: function(options) {
    this.articleContainer = options.articleContainer;
    this.regularRecommendContainer = options.regularRecommendContainer;
    this.hasRenderedRegularRecommend = false;
    this.articleId = options.articleId;
    this.category = options.category;
    this.random = Math.random();
    this.regularRecommendItems = [];
  },
  
  
  resetCacheHelper: function() {
    this.cache.itemDataFetched = false;
  },
  
  
  getPageCacheKey: function() {
    return "/article/" + this.articleId + "-recommend";
  },
  
  
  fetchFunction: function(fetchSequenceNumber, articlesPerFetch, fetchOptions, callbacks) {
    var articles = new Collection.Article.Recommend({
      fetchSequenceNumber: fetchSequenceNumber,
      articlesPerFetch: articlesPerFetch,
      articleId: this.articleId,
      category: this.category,
      random: this.random
    });
    articles.fetch(callbacks);
  },
  
  
  fetchDataSuccessHelperAfterAllActions: function(fetchedData) {
    if (!this.hasRenderedRegularRecommend) {
      this.hasRenderedRegularRecommend = true;
      this.cache.itemDataFetched = true;
      for (var index = 0; index < this.REGULAR_RECOMMEND_COUNT; ++index) {
        this.regularRecommendItems.push(this.cache.itemData[index]);
      }
      this.regularRecommendContainer.html(this.regularRecommendTemplate({recommendItems: this.regularRecommendItems}));
    }
  },
  
  
  renderHelper: function() {
    if (this.cache.itemDataFetched) {
      this.fetchDataSuccessHelperAfterAllActions();
    }
  },
  
  
  resetCacheHelper: function() {
    this.cache.pageLoadTimeSinceEpoch = $.now();   // in the unit "millisecond"
  },
  
  
  createItemData: function(fetchedItem) {
    var itemData = {
      id: fetchedItem.get("id"),
      title: fetchedItem.get("title"),
      picUrl: fetchedItem.get("cover_picture_url"),
      picHeight: fetchedItem.get("cover_picture_height"),
      picWidth: this.ITEM_PICTURE_WIDTH,
      width: this.cache.itemWidth
    };
    
    return itemData;
  },
  
  
  beAbleToScrollDown: function() {
    return this.cache.cascadeHeight + 200 > this.articleContainer.height();
  },
  
  
  onWidthChange: function() {
    if (this.$el.is(":visible")) {
      this.cache.firstVisibleBatch = -1;
      this.onScroll();
    }
  },
  
  
  getRegularRecommendItems: function() {
    return this.regularRecommendItems;
  }
});
