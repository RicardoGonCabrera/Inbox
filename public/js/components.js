
//Creating the Vue object.
const rootComponent = {
  data() {
    return{
      pollingId: null,
      userInbox: null,
      currentUser: null,
      selectedMail: null,
      mailList: true,
      mailReader: false,
      mailComposer: false,
      selectedMail: null,
      mailForwarder: false,
      addressBook: null,
      mailReplier: false,

    }
  },

  mounted: function() {
    this.refreshMailList()
    this.initCurrentUser()
    this.initAddressBook()
    this.pollingId = setInterval(() => {this.refreshMailList()},5000)
  },

  beforeUnmount: function() {
    clearInterval(this.pollingId)
  },

  methods: {
    setMail: function(event) {
      this.selectedMail = event
    },
    sendMail: function(mail){
      if(mail) {
        console.log(mail)
      } else {
        console.log("no hay nada")
      }
      fetch('/composedMail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mail)
      })
      .catch((error) => {
        console.error('Error: ', error)
      })
    }, // end sendMail

    deleteMail: function(){
      fetch('/mail/' + this.selectedMail.id.toString(), {
         method: 'DELETE',
         })
         .then(response => response.json())
         .then(aJson => {console.log(aJson)}).catch(err => {
         console.error(err)});
    },

    resetDisplay: function(elementoTrue) {
      this.mailReader = false
      this.mailComposer = false
      this.mailForwarder = false
      this.mailReplier = false
      switch(elementoTrue){
        case 1:
          this.mailReader = true
          break;
        case 2:
          this.mailComposer = true
          break;
        case 3:
          this.mailForwarder = true
          break;
        case 4: 
          this.mailReplier = true
          break;
        case 5:
          this.inputAddress = true
        default:
          break;
      }
    },

    refreshMailList: function(){
      fetch('/inbox').then(res => res.json()).then(aJson => {this.userInbox = aJson})
    },
    initCurrentUser: function() {
      fetch('/currentUser').then(res => res.json()).then(aJson => { this.currentUser = aJson })
    },
    initAddressBook: function(){
      fetch('/addressBook').then(res => res.json()).then(aJson => {this.addressBook = aJson})
    }, //end initAddressBook
  }, //end methods
  template:`
  <mail-list v-bind:inbox="userInbox" v-on:selectedMail="setMail($event)"></mail-list>
  <br> <br>
  <mail-reader v-if="mailReader" v-bind:mail="selectedMail"></mail-reader>
  <mail-composer v-if="mailComposer" v-bind:addressBook="addressBook" v-bind:user="currentUser"></mail-composer>
  <mail-forwarder v-if="mailForwarder" v-bind:mail="selectedMail" v-bind:addressBook="addressBook"></mail-forwarder>
  <mail-replier v-if="mailReplier" v-bind:mail="selectedMail"></mail-replier>`
} //end options

//==== mail-list==============================================================
const mailListComponent = {
  name: "mail-list",
  props: ['inbox'],
  emits: ['selectedMail'],
  data: function() {
    return {
      compose: false,
      mailReader: false
    }
  },
  methods: {
    click: function(mail) {
      this.$parent.resetDisplay(1)
      this.$emit('selectedMail',mail)

    }
  },
  template: `
  <button v-on:click="this.$parent.resetDisplay(2)">Compose</button>
  <h2>Inbox</h2>
  <ul>
  <li v-for="mail in inbox"><a v-on:click="click(mail)" >{{mail.from}}::{{mail.subject}}</a></li>
  </ul>
  <button v-on:click="this.$parent.refreshMailList()">Refresh</button>`
};

const  mailReaderComponent = {
  name: "mail-reader",
  props: ['mail'],
  methods: {
    eliminarMensaje: function() {
      this.$parent.resetDisplay(0)
      this.$parent.deleteMail()
    }
  },
  template: `<b>From:  </b> <span>{{mail.from}}</span><br>
  <b>To:  </b> <span>{{mail.to}}</span><br>
  <b>Subject:  </b> <span>{{mail.subject}}</span><br>
  <b>Body:  </b> <span>{{mail.body}}</span><br><br>
  <button v-on:click="this.$parent.resetDisplay(3)">Forward</button>
  <button v-on:click="this.$parent.resetDisplay(4)">Reply</button>
  <button v-on:click="eliminarMensaje()">Delete</button>
  `
};

const mailComposerComponent = {
  name: "mail-composer",
  props: ['addressBook','user'],
  data: function() {
    return {
      newMailCompose: {
        from: this.user,
        to: null,
        subject: null,
        body: null,
      }
    }
  },
  methods: {
    setReceiver: function(event) {
      this.newMailCompose.to = event
    },
    sendNewMail: function() {
      this.$parent.resetDisplay(0)
      this.$parent.sendMail(this.newMailCompose)
    }
  },
  template: ` <input-address v-bind:aBook="addressBook" v-on:selected="setReceiver($event)"></input-address> <br>
  <label>Subject: <input type="text" v-model="newMailCompose.subject"></label> <br>
  <label>Body: <textarea v-model="newMailCompose.body" rows="4" cols="50"></textarea></label> <br> <br>
  <button v-on:click="sendNewMail()">Send</button>`
}

const mailForwarderComponent = {
  name: "mail-forwarder",
  props: ['mail','addressBook'],
  data: function() {
    return {
      bookTrue: false,
      mailForwarded: {
        from: this.mail.to,
        to: null,
        subject: "Fw: " + this.mail.subject,
        body: this.mail.body
      },
    }
  },

  methods: {
    setReceiver: function(event) {
      this.mailForwarded.to = event
    },
    sendMail: function() {
      this.$parent.resetDisplay(0)
      this.$parent.sendMail(this.mailForwarded)
    }
  },
  template: `<form>
  <label>From: <input type="text" v-model="mailForwarded.from" readonly></label> <br>
  <input-address v-bind:aBook="addressBook" v-on:selected="this.setReceiver($event)"></input-address>
  <label>Subject:  <input type="text" v-model="mailForwarded.subject"></label><br>
  <label>Body:  <textarea v-model="mailForwarded.body" rows="4" cols="50"></textarea></label> 
  <br><br>
  </form>
  <button v-on:click="this.sendMail()">Send</button> `
};

const mailReplierComponent = {
  name: "mail-replier",
  props: ['mail'],
  data: function() {
    return {
      mailReplied: {
        from: this.mail.to,
        to: this.mail.from,
        subject: "Re: " + this.mail.subject,
        body: this.mail.body
      }
      
    }
  },
  methods: {
    sendMail: function() {
      this.$parent.resetDisplay(0)
      this.$parent.sendMail(this.mailReplied)
    }
  },
  template: `<form> 
  <label>From: <input type="text"  v-model="mailReplied.from" readonly></label> <br>
  <label>To:   <input type="text" v-model="mailReplied.to"> </label>  <br>
  <label>Subject:  <input type="text" v-model="mailReplied.subject"></label> <br>
  <label>Body: <textarea v-model="mailReplied.body" rows="4" cols="50"></textarea></label> 
  <br><br>
  </form>
  <button v-on:click="this.sendMail()">Send</button> `
};

const inputAdressComponent = {
  name: "input-address",
  props: ['aBook'],
  emits: ['selected'],
  data: function() {
    return {
      bookTrue: false,
      selectedAddress: null
    }
  },
  methods: {
    click: function(address) {
      this.selectedAddress = address
      this.bookTrue = !this.bookTrue
      this.$emit('selected', address)
    } 
  },
  watch: {
    selectedAddress: function() {
      this.$emit('selected',this.selectedAddress)
    }
  },
  template: `
  <label>To: <input type="text" v-model="selectedAddress"> <button type="button" v-on:click="bookTrue = !bookTrue">Adress Book</button></label> <br>
  <ul v-if="bookTrue">
  <li v-for="address in aBook"> <a v-on:click="click(address)">{{address}} </a></li>
  </ul>
  `
}

const app = Vue.createApp(rootComponent);
app.component('mail-list', mailListComponent);
app.component('mail-reader',mailReaderComponent);
app.component('mail-composer',mailComposerComponent);
app.component('mail-forwarder',mailForwarderComponent)
app.component('mail-replier',mailReplierComponent);
app.component('input-address',inputAdressComponent);
const vm = app.mount("#app");
