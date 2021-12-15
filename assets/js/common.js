var app = new Vue({
  el: '#app',
  data: {
    searchKeyword: '',
    searchResult: [],
    textDom: [],
  },
  beforeMount: function() {
    let sections = this.$el.querySelectorAll('section');
    for (i = 0; i < sections.length; ++i) {
      let s = sections[i];

      let articles = s.querySelectorAll('article');
      for (j = 0; j < articles.length; j++){
        let a = articles[j];

        let paragraphs = a.querySelectorAll('p,li');
        for (k = 0; k < paragraphs.length; k++){
          let p = paragraphs[k];

          let t = p.innerText;

          this.textDom.push({
            sectionIndex: i,
            sectionText: s.querySelector('h2')?.innerText,

            articleIndex: j,
            articleText: a.querySelector('h4')?.innerText,
            
            paragraphIndex: k,
            paragraphText: p.innerText,
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
        if(!keyword)
          this.searchResult = [];

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
          sectionYn: lastSectionIndex != item.sectionIndex,

          article: item.articleText, 
          articleIndex: item.articleIndex,

          text: text
        });

        lastSectionIndex = item.sectionIndex;
        lastArticleIndex = item.articleIndex;
      }

      this.searchResult = result;
    },
    goElement: function(event, item){
      this.searchKeyword = '';
      this.searchResult = [];

      let $this = this;
      this.$nextTick(() => {
        let index = item.articleIndex;
        let el = $this.$refs.articleRef[index];

        $this.scrollElement(el, -75);
      });
    },
    scrollElement: function (el, yOffset = 0){
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({top: y, behavior: 'smooth'});
    },
    wrapTag: function (text, tag, start, end) {
        return text.substring(0, start)
            + '<' + tag + '>'
            + text.substring(start, end)
            + '</' + tag + '>'
            + (end ? text.substring(end) : '');
    }
  }
})