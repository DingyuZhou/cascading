// define the view Show
View.Article.Show.Main = Backbone.View.extend({
  initialize: function(options) {
    this.id = options.id;
    this.isPreview = options.preview ? true : false;

    this.initialShowInGalleryMode = false;
    this.isGalleryOptionOn = false;
    this.galleryCurrentParagraphIndex = 0;
    this.galleryCurrentParagraph = null;

    if (options.initialInGalleryMode) {
      this.initialShowInGalleryMode = options.initialInGalleryMode;
      this.galleryCurrentParagraphIndex = 0;
    }

    this.allSubviews = [];
    this.articleParagraph = [];

    _.bindAll(this, "galleryKeyboardListener");
  },


  el: "#layout-content",


  template: JST["template/article/show/main"],
  galleryTemplate: JST["template/article/show/gallery"],


  render: function(options) {
    var that = this;
    var isPreview = that.isPreview;

    var article = new Model.Article({id: that.id});
    article.fetch({
      success: function(fetchedArticle) {
        that.$el.html(that.template({article: fetchedArticle, articleContent: that.parseArticleContent(fetchedArticle), preview: isPreview}));

        if (!isPreview) {
          that.galleryContainer = $("#article-show-gallery");
          var initialShowInGalleryMode = that.initialShowInGalleryMode;
          if (initialShowInGalleryMode) {
            that.galleryContainer.show();
          }

          $(".Delete_Article").one("click", function(event) {
            that.deleteArticle(event);
          });

          // header sub title
          var id = fetchedArticle.get("id");
          var title = fetchedArticle.get("title");
          that.articleTitle = title;
          var titleLink = "<a href='#/article/" + id + "' title = '" + title + "'>" + title + "</a>";
          GlobalVariable.Layout.Header.UpdateSubTitle(titleLink);

          // browsing history
          var historyArticle = {};
          historyArticle.id = id;
          historyArticle.title = title;
          historyArticle.author = fetchedArticle.get("author");
          historyArticle.authorUserId = fetchedArticle.get("user_id");
          historyArticle.abstract = fetchedArticle.get("abstract");
          GlobalVariable.BrowsingHistory.push(historyArticle);

          // recommend
          var viewRecommendCascade = new View.Article.Show.Recommend({
            articleContainer: $("#article-show-content"),
            regularRecommendContainer: $("#article-show-recommend-regular"),
            articleId: id,
            category: fetchedArticle.get("category_name")
          });
          that.allSubviews.push(viewRecommendCascade);
          viewRecommendCascade.render();
          that.viewRecommendCascade = viewRecommendCascade;

          // comment
          var viewComment = new View.Article.Show.Comment({articleId: id});
          that.allSubviews.push(viewComment);
          viewComment.render();

          if (initialShowInGalleryMode) {
            that.openGallery();
            that.initialShowInGalleryMode = false;   // set to default value to avoid unexpect errors
          }
        }
      }
    });

    return that;
  },


  deleteArticle: function(event) {
    event.preventDefault();

    var id = $(event.currentTarget).data("articleId");
    var article = new Model.Article({id: id});
    article.destroy({
      success: function() {
        Backbone.history.navigate("#", {trigger: true});
      },
      error: function() {
        alert("Delete article failed. Please try it again. Thanks!");
        Backbone.history.navigate("#", {trigger: true});
      }
    });
  },


  parseArticleContent: function(article) {
    var articleParagraph = [];
    articleParagraph.push("preserve for article title");
    var index = 1;

    if (article.get("cover_picture_imported")) {
      articleParagraph.push({type: "picture", src: {url: article.get("cover_picture_url").replace("/thumb/", "/medium/")}});
      ++index;
    }

    var contentObj = JSON.parse(article.get("content"));
    var contentHtml = "";

    _.each(contentObj, function(paragraph) {
      articleParagraph.push(paragraph);
      if (paragraph.type === "text") {
        contentHtml += "<p class='article-show-text-container'>" + paragraph.src + "</p>";
        ++index;
      } else if (paragraph.type === "picture") {
        contentHtml += "<pre class='article-show-picture-container'><img class='article-show-picture' src='"
          + paragraph.src.url
          + "' data-paragraph-index='"
          + index
          + "'></pre>";

        ++index;
      }
    });

    this.articleParagraph = articleParagraph;
    return contentHtml;
  },


  events: {
    "click .article-show-picture": "openGallery",
    "click #article-show-gallery-content": "galleryOptions",
    "click #article-show-gallery-prev": "prevGalleryParagraph",
    "click #article-show-gallery-next": "nextGalleryParagraph",
    "click #article-show-gallery-original-img": "showOriginalImage",
    "click #article-show-gallery-close": "closeGallery"
  },


  openGallery: function(event) {
    var initialShowInGalleryMode = this.initialShowInGalleryMode;
    if (!initialShowInGalleryMode) {
      event.preventDefault();
    }

    var galleryContainer = this.galleryContainer;
    if (galleryContainer.length > 0) {
      if (!initialShowInGalleryMode) {
        this.galleryCurrentParagraphIndex = parseInt($(event.currentTarget).data("paragraphIndex"));
      }

      var that = this;
      $(document).on("keyup", function(event) {
        that.galleryKeyboardListener(event);
      });

      GlobalVariable.Layout.Header.Hide(0);
      galleryContainer.html(this.galleryTemplate());
      $(".article-show-gallery-content-wrapper").html(this.galleryParagraph(this.galleryCurrentParagraphIndex));
      this.galleryCurrentParagraph = $(".article-show-gallery-content-wrapper");
      galleryContainer.fadeIn("slow");
    }
  },


  galleryParagraph: function(paragraphIndex) {
    var paragraphCount = this.articleParagraph.length;
    if (paragraphIndex < 0) {
      return null;
    } else if (paragraphIndex === 0) {
      return "<div class='article-show-gallery-title'>" + this.articleTitle + "</div>";
    } else if (paragraphIndex < paragraphCount) {
      var paragraph = this.articleParagraph[paragraphIndex];
      this.updateGalleryOptions(paragraph.type);
      if (paragraph.type === "text") {
        return "<div class='article-show-gallery-text'>" + paragraph.src + "</div>";
      } else if (paragraph.type === "picture") {
        return "<img class='article-show-gallery-img' src='" + paragraph.src.url + "'>";
      }
    } else if (paragraphIndex === paragraphCount) {
      var recommendItems = this.viewRecommendCascade.getRegularRecommendItems();
      var itemCount = recommendItems.length;
      var recommendContent = "<div class='article-show-gallery-recommend'><h2>You May Also Like:</h2><div class='row'>";
      for (var index = 0; index < itemCount; ++index) {
        var item = recommendItems[index];
        if (item) {
          recommendContent += "<div class='col-xs-6 col-sm-3 article-show-recommend-regular-item'>"
            + "<a class='article-show-recommend-regular-pic-link' href='#/article/" + item.id + "/gallery'>"
            + "<div class='article-show-recommend-regular-pic' style=\"background: url('" + item.picUrl + "') no-repeat center center; background-size: 100% auto;\"></div>"
            + "</a>"
            + "<h5><a href='#/article/" + item.id + "'/gallery>" + item.title + "</a></h5>"
          + "</div>";
        }
      }
      recommendContent += "</div></div>";
      return recommendContent;
    } else {
      return null;
    }
  },


  galleryOptions: function(event) {
    if (this.isGalleryOptionOn) {
      this.isGalleryOptionOn = false;
      $("#article-show-gallery-main").transition({y: 0});
    } else {
      this.isGalleryOptionOn = true;
      $("#article-show-gallery-main").transition({y: "-150px"});
    }
  },


  updateGalleryOptions: function(paragraphType) {
    var leftOptions = $("#article-show-gallery-options-left");
    if (paragraphType === "picture") {
      leftOptions.html("<button id='article-show-gallery-original-img'>Original Image</button>");
    } else {
      leftOptions.empty();
    }
  },


  closeGallery: function(event) {
    if (event) {
      event.preventDefault();
    }

    this.isGalleryOptionOn = false;
    this.galleryCurrentParagraph = null;
    GlobalVariable.Layout.Header.Show("slow");
    this.galleryContainer.fadeOut("slow");

    $(document).off("keyup");
  },


  prevGalleryParagraph: function(event) {
    var current = this.galleryCurrentParagraph;
    var prevParagraphIndex = this.galleryCurrentParagraphIndex - 1;
    var prevContent = this.galleryParagraph(prevParagraphIndex);
    current.removeAttr("style");
    current.prevAll().remove();
    current.nextAll().remove();
    if (prevContent) {
      this.galleryCurrentParagraphIndex = prevParagraphIndex;
      var prevParagraph = $(prevContent);
      prevParagraph.addClass("hide");
      var prev = $("<div class='article-show-gallery-content-wrapper'></div>");
      prev.append(prevParagraph);
      current.before(prev);
      current.transition({x: "100%", scale: 0}, 600);
      prevParagraph.fadeIn(600);
      this.galleryCurrentParagraph = prev;
    } else {
      current.transition({x: "30%"}, 400).transition({x: 0}, 400);
    }
  },


  nextGalleryParagraph: function(event) {
    var current = this.galleryCurrentParagraph;
    var nextParagraphIndex = this.galleryCurrentParagraphIndex + 1;
    var nextContent = this.galleryParagraph(nextParagraphIndex);
    current.removeAttr("style");
    current.prevAll().remove();
    current.nextAll().remove();
    if (nextContent) {
      this.galleryCurrentParagraphIndex = nextParagraphIndex;
      var nextParagraph = $(nextContent);
      nextParagraph.addClass("hide");
      var next = $("<div class='article-show-gallery-content-wrapper'></div>");
      next.append(nextParagraph);
      current.after(next);
      current.transition({x: "-100%", scale: 0}, 600);
      nextParagraph.fadeIn(600);
      this.galleryCurrentParagraph = next;
    } else {
      current.transition({x: "-30%"}, 400).transition({x: 0}, 400);
    }
  },


  showOriginalImage: function(event) {
    if (event) {
      event.preventDefault();
    }
    var paragraphCount = this.articleParagraph.length;
    var index = this.galleryCurrentParagraphIndex;
    if (index >=0 && index < paragraphCount) {
      var paragraph = this.articleParagraph[index];
      if (paragraph.type === "picture") {
        $("#article-show-gallery-main").removeAttr("style");
        this.isGalleryOptionOn = false;
        var container = this.galleryCurrentParagraph;
        container.html("<img class='article-show-gallery-img' src='" + paragraph.src.url.replace("/medium/", "/original/") + "'>");
      }
    }
  },


  galleryKeyboardListener: function(event) {
    event.preventDefault();

    switch(event.keyCode) {
      case 27:
        this.closeGallery();
        break;
      case 37:
        this.prevGalleryParagraph();
        break;
      case 39:
        this.nextGalleryParagraph();
        break;
    }
  },


  onWidthChange: function() {
    if (this.viewRecommendCascade) {
      this.viewRecommendCascade.onWidthChange();
    }
  },


  remove: function() {
    $(document).off("keyup");
    $(".Delete_Article").off("click");
    $("#article-show").off("click");

    var subview;
    while (this.allSubviews.length > 0) {
      subview = this.allSubviews.pop();
      if (subview) {
        subview.remove();
      }
    }

    Backbone.View.prototype.remove.call(this);
  }
});
