(function() {
  Polymer.AppLayout.registerEffect('px-app-header-scroll-effect', {
    setUp: function(config) {
      // the effect's config is passed to the setUp.
      this.navContainer = { navElement: Polymer.dom(this).querySelector('[nav-container]') };
      this.navContainer.navHeight = parseInt(getComputedStyle(this.navContainer.navElement).height, 10);
      this.navContainer.navElement.style.willChange = 'transform';
      this.headerContainer = { headerElement: Polymer.dom(this).querySelector('[header-container]') };
      this.headerContainer.headerHeight = parseInt(getComputedStyle(this.headerContainer.headerElement).height, 10);
      this.condensedHeaderSize = (this.headerContainer.headerHeight >= 5 ? 5 : 0);
    },

    run: function(progress) {
      let dy = ((this.navContainer.navHeight - this.headerContainer.headerHeight + this.condensedHeaderSize) * progress);
      this.transform(`translateY(${dy}px)`, this.navContainer.navElement);
      if(progress === 0){
        this.dispatchEvent(new CustomEvent('px-app-header-scroll-reset'));
      }
    },

    tearDown: function() {
       // clean up and reset of states
       this.navContainer.navElement.style.willChange = "auto";
       delete this.navContainer;
       delete this.headerContainer;

    }
  });
})();
