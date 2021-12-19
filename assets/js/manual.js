var headerApp = new Vue({
  el: '#header-app',
  data: {
    searchKeyword: '',
    searchResult: [],
    resultShow: false,
    textDom: []
  },
  mounted: function(){
    let sections = document.querySelectorAll('section');
    for (i = 0; i < sections.length; ++i) {
      let s = sections[i];
    
      let articles = s.querySelectorAll('article');
      for (j = 0; j < articles.length; j++){
        let a = articles[j];
    
        let paragraphs = a.querySelectorAll('p,li');
        for (k = 0; k < paragraphs.length; k++){
          let p = paragraphs[k];
    
          this.textDom.push({
            sectionIndex: i,
            sectionText: this.refineText(s.querySelector('h2')?.textContent),
    
            articleIndex: j,
            articleText: this.refineText(a.querySelector('h4')?.textContent),
            
            paragraphIndex: k,
            paragraphText: this.refineText(p.textContent),
          });
        }
      }
    }
  },
  methods: {
    search: function() {
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

      for (i = 0; i < this.textDom.length; i++){
        let item = this.textDom[i];

        if(lastArticleIndex == item.articleIndex)
          continue;

        let index = item.paragraphText.toLowerCase().indexOf(this.searchKeyword);

        if (index < 0)
          continue;

        let spanClass = lastSectionIndex == item.sectionIndex ? '' : 'search-border-top';
        spanClass += (i + 1 >= this.textDom.length) || this.textDom[i + 1].sectionIndex != item.sectionIndex ? '' : ' search-border-bottom';

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
    goElement: function(event, item){
      this.searchKeyword = '';
      this.searchResult = [];
      this.searchToggle(false);

      let $this = this;
      this.$nextTick(() => {
        let sectionIndex = item.sectionIndex;
        let articleIndex = item.articleIndex;

        let curSectionIndex = window.swiper.getPos();
        if(curSectionIndex != sectionIndex){
          window.articleIndex = articleIndex;
          window.swiper.slide(sectionIndex);
        }else{
          let sectionEl = document.querySelector("section:nth-of-type(" + (sectionIndex + 1) + ")");
          window.goArticle(sectionEl, articleIndex, -105);
        }
      });
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

window.swiper = new Swipe(sliderContainer, {
  draggable: true,
  autoRestart: false,
  continuous: false,
  disableScroll: true,
  stopPropagation: true,
  callback: function(index, element) {
    console.log('callback', index, element);
  },
  transitionEnd: function(index, element) {
    if(window.articleIndex){
      window.goArticle(element, window.articleIndex, -105);
    }
    
    window.articleIndex = undefined;
  }
});

window.goArticle = function(parent, index, margin){
  let el = parent.querySelector("article:nth-of-type(" + (index + 1) + ")");

  const y = el.getBoundingClientRect().top + window.pageYOffset + margin;
  console.log(window.pageYOffset, el.getBoundingClientRect().top);

  window.scrollTo({top: y, behavior: 'smooth'});
}

prevBtn.onclick = swiper.prev;
nextBtn.onclick = swiper.next;
