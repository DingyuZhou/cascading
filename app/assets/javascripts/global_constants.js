// MVC structure
var Models = {};
var Collections = {};
var Views = {};


var GlobalConstant = {
  ArticleStatus: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
    DRAFT: 0,
    PRIVATE_PUBLISHED: 1,
    PUBLIC_PUBLISHED: 2
  },
  
  
  Screen: {
    HEIGHT: screen.height,
    WIDTH: screen.width
  },
  
  
  Layout: {
    SHOWN_NAV_Z_INDEX: -998,
    HIDDEN_NAV_Z_INDEX: -1000,
    NAV_BLOCKER_Z_INDEX: -990,
  },
  
  
  UserTier: {   // If this enumeration needs to be modified, please modify the corresponding one in the "Ruby on Rails" code together.
    ADMINISTRATOR: 0,
    FREE_USER: 1
  }
};
