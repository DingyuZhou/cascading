View.Captcha = Backbone.View.extend({
  initialize: function(options) {
    this.validateCallback = null;
    if (options && options.validateCallback) {
      this.validateCallback = options.validateCallback;
    }
    
    this.maxTokenCount = 4;
    this.token = [];
    this.tokenDot = [];
    this.passCaptcha = false;
    
    this.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.DOTS = [
      ['   *   ', '  * *  ', '  * *  ', ' *   * ', ' ***** ', '*     *', '*     *'],
      ['****** ', '*     *', '*     *', '****** ', '*     *', '*     *', '****** '],
      [' ***** ', '*     *', '*      ', '*      ', '*      ', '*     *', ' ***** '],
      ['****** ', '*     *', '*     *', '*     *', '*     *', '*     *', '****** '],
      ['*******', '*      ', '*      ', '****   ', '*      ', '*      ', '*******'],
      ['*******', '*      ', '*      ', '****   ', '*      ', '*      ', '*      '],
      [' ***** ', '*     *', '*      ', '*      ', '*   ***', '*     *', ' ***** '],
      ['*     *', '*     *', '*     *', '*******', '*     *', '*     *', '*     *'],
      ['*******', '   *   ', '   *   ', '   *   ', '   *   ', '   *   ', '*******'],
      ['      *', '      *', '      *', '      *', '      *', '*     *', ' ***** '],
      ['*     *', '*   ** ', '* **   ', '**     ', '* **   ', '*   ** ', '*     *'],
      ['*      ', '*      ', '*      ', '*      ', '*      ', '*      ', '*******'],
      ['*     *', '**   **', '* * * *', '*  *  *', '*     *', '*     *', '*     *'],
      ['*     *', '**    *', '* *   *', '*  *  *', '*   * *', '*    **', '*     *'],
      [' ***** ', '*     *', '*     *', '*     *', '*     *', '*     *', ' ***** '],
      ['****** ', '*     *', '*     *', '****** ', '*      ', '*      ', '*      '],
      [' ***** ', '*     *', '*     *', '*     *', '*   * *', '*    * ', ' **** *'],
      ['****** ', '*     *', '*     *', '****** ', '*   *  ', '*    * ', '*     *'],
      [' ***** ', '*     *', '*      ', ' ***** ', '      *', '*     *', ' ***** '],
      ['*******', '   *   ', '   *   ', '   *   ', '   *   ', '   *   ', '   *   '],
      ['*     *', '*     *', '*     *', '*     *', '*     *', '*     *', ' ***** '],
      ['*     *', '*     *', ' *   * ', ' *   * ', '  * *  ', '  * *  ', '   *   '],
      ['*     *', '*     *', '*     *', '*  *  *', '* * * *', '**   **', '*     *'],
      ['*     *', ' *   * ', '  * *  ', '   *   ', '  * *  ', ' *   * ', '*     *'],
      ['*     *', ' *   * ', '  * *  ', '   *   ', '   *   ', '   *   ', '   *   '],
      ['*******', '     * ', '    *  ', '   *   ', '  *    ', ' *     ', '*******']
    ];
    
/* 0 ~ 9
    [
      ['  ***  ', ' *   * ', '*   * *', '*  *  *', '* *   *', ' *   * ', '  ***  '],
      ['   *   ', '  **   ', ' * *   ', '   *   ', '   *   ', '   *   ', '*******'],
      [' ***** ', '*     *', '      *', '     * ', '   **  ', ' **    ', '*******'],
      [' ***** ', '*     *', '      *', '    ** ', '      *', '*     *', ' ***** '],
      ['    *  ', '   **  ', '  * *  ', ' *  *  ', '*******', '    *  ', '    *  '],
      ['*******', '*      ', '****** ', '      *', '      *', '*     *', ' ***** '],
      ['  **** ', ' *     ', '*      ', '****** ', '*     *', '*     *', ' ***** '],
      ['*******', '     * ', '    *  ', '   *   ', '  *    ', ' *     ', '*      '],
      [' ***** ', '*     *', '*     *', ' ***** ', '*     *', '*     *', ' ***** '],
      [' ***** ', '*     *', '*     *', ' ******', '      *', '     * ', ' ****  ']
    ];
*/
  },
  
  
  tagName: "div",
  className: "captcha-container",
  
  
  render: function() {
    this.pickTokens();
    var html ="<div class='captcha-row captcha-refresh-reminder'><i><small>Click Picture to Change One</small></i></div>"
        + this.makeDotCaptcha(this.combineTokens())
        +"<div class='captcha-row'>Please Type Letters Shown Above:</div><div class='captcha-row'><input type='textfield' class='captcha-answer'></div>";
    this.$el.html(html);
    $(function() {
      $(".captcha-challenge").show(1000);
    });
    return this;
  },
  
  
  noiseString: function(length) {
    var noiseStr = "";
    for (var index = 0; index < length; ++ index) {
      if (Math.floor(Math.random() * 20) > 0) {
        noiseStr += " ";
      } else {
        noiseStr += "*";
      }
    }
    return noiseStr;
  },
  
  
  complicateDot: function(dotIndex) {
    var dot = this.DOTS[dotIndex].slice(0);   // copy value
    var dotWidth = dot[0].length;
    var dotHeight = dot.length;
    
    var oddDotHorizontalPosition = Math.floor(Math.random() * dotHeight);
    var oddDotVerticalPosition = Math.floor(Math.random() * dotWidth);
    var oddDotLine = dot[oddDotHorizontalPosition];
    var originalOddDot = oddDotLine.charAt(oddDotVerticalPosition);
    var oddDot = (originalOddDot === '*') ? ' ' : '*';
    dot[oddDotHorizontalPosition] = oddDotLine.substring(0, oddDotVerticalPosition) + oddDot + oddDotLine.substring(oddDotVerticalPosition + 1);
    
    var horizontalNoiseLineCount = 0;
    var verticalNoiseLineCount = 0;
    var noiseLineDirection = Math.floor(Math.random() * 2);
    if (noiseLineDirection === 0) {
      ++horizontalNoiseLineCount;
    } else {
      ++verticalNoiseLineCount;
    }
    
    var topMargin = Math.floor(Math.random() * (dotHeight + 1 - horizontalNoiseLineCount));
    var bottomMargin = dotHeight - horizontalNoiseLineCount - topMargin;
    var leftMargin = Math.floor(Math.random() * (dotWidth + 1 - verticalNoiseLineCount));
    var rightMargin = dotWidth - verticalNoiseLineCount - leftMargin;
    
    if (horizontalNoiseLineCount > 0) {
      var noiseLine = "";
      for (var index = 0; index < dotWidth; ++index) {
        noiseLine += " ";
      }
      var noiseLinePosition = Math.floor(Math.random() * (dotHeight - 1)) + 1;
      dot.splice(noiseLinePosition, 0, noiseLine);
      dotHeight = dot.length;
    }
    
    if (verticalNoiseLineCount > 0) {
      var noiseLinePosition = Math.floor(Math.random() * (dotWidth - 1)) + 1;
      for (var index = 0; index < dotHeight; ++index) {
        var originalLine = dot[index];
        dot[index] = originalLine.substring(0, noiseLinePosition) + " " + originalLine.substring(noiseLinePosition);
      }
      dotWidth = dot[0].length;
    }
    
    var emptyLine = this.noiseString(dotWidth).replace(/\*/g, " ");
    var topMarginDot = [];
    for (var index = 0; index < topMargin; ++index) {
      topMarginDot.push(this.noiseString(dotWidth));
    }
    topMarginDot.push(emptyLine);
    dot = topMarginDot.concat(dot);
    
    dot.push(emptyLine);
    for (var index = 0; index < bottomMargin; ++index) {
      dot.push(this.noiseString(dotWidth));
    }
    
    dotHeight = dot.length;
    for (var index = 0; index < dotHeight; ++index) {
      dot[index] = this.noiseString(leftMargin) + " " + dot[index] + " " + this.noiseString(rightMargin);
    }
    
    return dot;
  },
  
  
  makeDotCaptcha: function(dot) {
    var lineCount = dot.length;
    var dotCaptchaHtml = "<div class='captcha-challenge'><div class='captcha-challenge-text'>";
    for (var index = 0; index < lineCount; ++index) {
      dotCaptchaHtml += dot[index].replace(/ /g, "&#160;") + "&#160;&#160;<br>";
    }
    dotCaptchaHtml += "</div></div>";
    return dotCaptchaHtml;
  },
  
  
  pickTokens: function() {
    this.passCaptcha = false;
    
    var tokenCount = Math.floor(Math.random() * (this.maxTokenCount - 1)) + 2;
    
    var allTokensCount = this.DOTS.length;
    var tokenSubset = [];
    while (tokenCount > 0) {
      var randomIndex = Math.floor(Math.random() * allTokensCount);
      var available = true;
      for (var index in tokenSubset) {
        if (tokenSubset[index] === randomIndex) {
          available = false;
          break;
        }
      }
      if (available) {
        tokenSubset.push(randomIndex);
        --tokenCount;
      }
    }
    
    this.token = tokenSubset;
    var tokenDot = [];
    for (var index in tokenSubset) {
      tokenDot.push(this.complicateDot(tokenSubset[index]));
    }
    this.tokenDot = tokenDot;
  },
  
  
  combineTokens: function() {
    var tokenDot = this.tokenDot;
    var tokenCount = tokenDot.length;
    var noiseTokenCount = this.maxTokenCount - tokenCount;
    if (noiseTokenCount > 0) {
      var noiseWidth = noiseTokenCount * tokenDot[0].length;
      var usedNoiseWidth = 0;
      for (var index in tokenDot) {
        usedNoiseWidth = Math.floor(Math.random() * (noiseWidth + 1));
        noiseWidth = noiseWidth - usedNoiseWidth;
        for (var line in tokenDot[index]) {
          tokenDot[index][line] += this.noiseString(usedNoiseWidth);
        }
      }
      for (var line in tokenDot[0]) {
        tokenDot[0][line] = this.noiseString(noiseWidth) + tokenDot[0][line];
      }
    }
    var combinedDot = [];
    var lineCount = tokenDot[0].length;
    for(var line = 0; line < lineCount; ++line) {
      var lineDot = "";
      for (var index in tokenDot) {
        lineDot += tokenDot[index][line];
      }
      combinedDot.push(lineDot);
    }
    return combinedDot;
  },
  
  
  events: {
    "click .captcha-challenge": "refreshChallenge",
    "keyup .captcha-answer": "validateAnswer"
  },
  
  
  refreshChallenge: function(event) {
    event.stopImmediatePropagation();
    
    var that = this;
    
    $(".captcha-challenge").remove();
    that.pickTokens();
    $(".captcha-refresh-reminder").after(that.makeDotCaptcha(this.combineTokens()));
    $(function() {
      $(".captcha-challenge").show(1000);
      that.$el.trigger("click");   // keep propagate "click" event.
    });
  },
  
  
  validateAnswer: function(event) {
    var answerInput = $(event.currentTarget);
    var answer = answerInput.val().toLowerCase();
    var answerLength = answer.length;
    var tokenLength = this.token.length;
    var correctAnswerLength = false;
    if (answerLength === tokenLength) {
      correctAnswerLength = true;
    }
    var goodAnswerInputTillNow = true;
    if (answerLength > tokenLength) {
      goodAnswerInputTillNow = false;
    } else {
      var letterStartCode = "a".charCodeAt(0);
      for (var index = 0; index < answerLength; ++index) {
        if ((answer.charCodeAt(index) - letterStartCode) != this.token[index]) {
          goodAnswerInputTillNow = false;
          break;
        }
      }
    }
    var passCaptcha = goodAnswerInputTillNow && correctAnswerLength;
    if (goodAnswerInputTillNow) {
      answerInput.removeClass("captcha-incorrect-answer");
      if (passCaptcha) {
        answerInput.addClass("captcha-correct-answer");
      }
    } else {
      answerInput.removeClass("captcha-correct-answer");
      answerInput.addClass("captcha-incorrect-answer");
    }
    this.passCaptcha = passCaptcha;
    if (this.validateCallback) {
      this.validateCallback(passCaptcha);
    }
  },
  
  
  hasPassedCaptcha: function() {
    return this.passCaptcha;
  }
});