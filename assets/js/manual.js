var headerApp = new Vue({
  el: '#header-app',
  data: {
    searchKeyword: '',
    searchResultIndex: [],
    searchResult: [],
    resultShow: false,
    articleList: [],
    paragraphList: []
  },
  mounted: function(){
    let sections = document.querySelectorAll('section');
    for (i = 0; i < sections.length; ++i) {
      let s = sections[i];
      let sectionText = this.refineText(s.querySelector('h2')?.textContent);
    
      let articles = s.querySelectorAll('article');
      for (j = 0; j < articles.length; j++){
        let a = articles[j];
        let articleText = this.refineText(a.querySelector('h4')?.textContent);

        this.articleList.push({
          sectionIndex: i,
          sectionText: sectionText,
  
          articleIndex: j,
          articleText: articleText,
        });
    
        let paragraphs = a.querySelectorAll('p,li');
        for (k = 0; k < paragraphs.length; k++){
          let p = paragraphs[k];
          let paragraphText = this.refineText(p.textContent);
    
          this.paragraphList.push({
            sectionIndex: i,
            sectionText: sectionText,
    
            articleIndex: j,
            articleText: articleText,
            
            paragraphIndex: k,
            paragraphText: paragraphText,
          });
        }
      }
    }
  },
  methods: {
    search: function() {
      let resultIndex = [];
      let result = [];
      let keyword = this.searchKeyword.toLowerCase();
      var lastSectionIndex = -1;
      var lastArticleIndex = -1;

      if(!keyword || keyword.length < 2){
        if(!keyword){
          this.searchResult = [];
          this.searchToggle(false);
        }

        return;
      }

      for( i = 0; i < this.articleList.length; i++){
        let item = this.articleList[i];

        let index = item.articleText.toLowerCase().indexOf(keyword);

        if (index < 0)
          continue;

        let articleText = item.articleText.toLowerCase();
        let bStart = articleText.indexOf(keyword);
        let bEnd = bStart + keyword.length;

        let text = this.wrapTag(articleText, 'b', bStart, bEnd);

        resultIndex.push({ 
          section: item.sectionText, 
          sectionIndex: item.sectionIndex,

          article: text, 
          articleIndex: item.articleIndex,
        });
      }

      this.searchResultIndex = resultIndex;

      for (i = 0; i < this.paragraphList.length; i++){
        let item = this.paragraphList[i];

        if(lastArticleIndex == item.articleIndex)
          continue;

        let index = item.paragraphText.toLowerCase().indexOf(keyword);

        if (index < 0)
          continue;

        let spanClass = lastSectionIndex == item.sectionIndex ? '' : 'search-border-top';
        spanClass += (i + 1 >= this.paragraphList.length) || this.paragraphList[i + 1].sectionIndex != item.sectionIndex ? '' : ' search-border-bottom';

        const padding = 70;
        let start = index - padding < 0 ? 0 : index - padding;
        let end = start + padding * 2 > item.paragraphText.length ? item.paragraphText.length : start + padding * 2;

        let split = item.paragraphText.substring(start, end);
        let lowerSplit = split.toLowerCase();
        let bStart = lowerSplit.indexOf(keyword);
        let bEnd = bStart + keyword.length;

        let text = this.wrapTag(split, 'b', bStart, bEnd);

        result.push({ 
          spanClass: spanClass,

          section: item.sectionText, 
          sectionIndex: item.sectionIndex,
          sectionYn: lastSectionIndex != item.sectionIndex,

          article: item.articleText, 
          articleIndex: item.articleIndex,

          text: text
        });

        lastSectionIndex = item.sectionIndex;
        lastArticleIndex = item.articleIndex;
      }

      this.searchResult = result;

      this.searchToggle(true);
    },
    searchToggle: function(isShow){
      if(isShow){
        this.resultShow = true;
        document.getElementById('body-app').style.display = 'none';
      }else{
        this.resultShow = false;
          document.getElementById('body-app').style.display = 'block';
      }
    },
    refineText: function(text){
      if(!text)
        return text;
      text = text.replace(/(\r\n|\n|\r)/gm, "");
      return text.trim();
    },
    goElement: function(event, sectionIndex, articleIndex){
      this.toggleNavbar();

      this.searchKeyword = '';
      this.searchResult = [];
      this.searchToggle(false);

      let $this = this;
      this.$nextTick(() => {
        window.goSection(sectionIndex, articleIndex);
      });
    },
    toggleNavbar: function (){
      if(!this.$refs.navbarToggleButton.offsetParent)
        return;

      if(!this.$refs.navbarToggle.offsetParent)
        return;

      const bsCollapse = new bootstrap.Collapse(this.$refs.navbarToggle);
      bsCollapse.hide();
    },
    wrapTag: function (text, tag, start, end) {
        return text.substring(0, start)
            + '<' + tag + '>'
            + text.substring(start, end)
            + '</' + tag + '>'
            + (end ? text.substring(end) : '');
    }
  }
});

let sliderContainer = document.getElementById('slider-container');
let prevBtn = document.getElementById('slider-prev');
let nextBtn = document.getElementById('slider-next');

window.topMargin = -105;

window.swiper = new Swipe(sliderContainer, {
  draggable: true,
  autoRestart: false,
  continuous: false,
  disableScroll: true,
  stopPropagation: true,
  callback: function(index, element) {
  },
  transitionEnd: function(index, element) {
    if(window.articleIndex >= 0){
      window.goArticle(element, window.articleIndex);
    }
    
    window.articleIndex = undefined;
  }
});

window.goSection = function(sectionIndex, articleIndex){
  if(articleIndex == undefined){
    window.swiper.slide(sectionIndex);
    return;
  }

  let curSectionIndex = window.swiper.getPos();
  if(curSectionIndex != sectionIndex){
    window.articleIndex = articleIndex;
    window.swiper.slide(sectionIndex);
  }else{
    let sectionEl = document.querySelector("section:nth-of-type(" + (sectionIndex + 1) + ")");
    window.goArticle(sectionEl, articleIndex);
  }
}

window.goArticle = function(parent, index){
  let el = parent.querySelector("article:nth-of-type(" + (index + 1) + ")");

  const y = el.getBoundingClientRect().top + window.pageYOffset + window.topMargin;

  window.scrollTo({top: y, behavior: 'smooth'});
}

prevBtn.onclick = swiper.prev;
nextBtn.onclick = swiper.next;
