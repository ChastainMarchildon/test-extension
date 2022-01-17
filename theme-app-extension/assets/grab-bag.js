class GrabBag extends HTMLButtonElement  {
    constructor() {
      super();
      this.listen();
    }
    /*
    connectedCallback() {
        this.addEventListener('click', this.getCartContents)
    }
    */
  
    async getCartContents(){
        const result = await fetch("/cart.json");

        if (result.status === 200) {
            return result.json(); 
        }

    }

    listen() {

        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.initiatorType === "fetch" && entry.name.toLowerCase().indexOf("cart/update") > 0  || entry.name.toLowerCase().indexOf("cart/add") > 0 || entry.name.toLowerCase().indexOf("cart/change") > 0) {
                console.log('Fetch request detected to', entry.name);               
                fetch('/cart.json')
                .then(res => res.json())
                .then(responseData => {
                    console.log(responseData);
                    this.updateWidget(responseData);
                  })
              }
              else if(entry.initiatorType === "navigation"){
                console.log('Navigation request detected to', entry.name);               
                fetch('/cart.json')
                .then(res => res.json())
                .then(responseData => {
                    console.log(responseData);
                    this.updateWidget(responseData);
                  })
              }
            }
          });
          
          observer.observe({
            entryTypes: ["resource", "event", "navigation"]
          });

    }

    updateWidget(cartArray){
        var current = cartArray.items_subtotal_price / 100;
        var thresholdPrice = document.getElementById("grab-bag").getAttribute("threshold") /100;
        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          });
        if(current > thresholdPrice){
            var e = document.getElementById("gb-overlayContent");
            var x = document.getElementById("gb-giftContent");
            for(var i = 0; i<cartArray.items.length; i++){
                if(cartArray.items[i].discounts.length > 0){
                    e.innerHTML = "Gift Added"
                    x.style.display = "none";
                    return;
                }
                else{
                    e.style.display = "none";
                    x.style.display = "grid"
                }
                
            }
        }
        else{
            var e = document.getElementById("gb-overlayContent");
            var x = document.getElementById("gb-giftContent");
            var difference = thresholdPrice - current;
            difference = formatter.format(difference);
            e.style.display = "grid"
            x.style.display = "none"
            e.innerHTML = "You're "+ difference + " away from a free gift!"
            console.log("under threshhold")
        }
    }

    get thresholdPrice() {
        return this.getAttribute('threshold');
      }

    set thresholdPrice(val) {
        if (val == null) { // check for null and undefined
          this.removeAttribute('videoid');
        }
        else {
          this.setAttribute('threshold', val);
        }
      }
    

  }
  

  customElements.define('grab-bag', GrabBag, { extends: "button" })