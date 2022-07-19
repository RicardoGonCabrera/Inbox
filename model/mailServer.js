const userDB = require("./userDB").userDB;

//defining the model
/**
 * Mail constructor.
 * @param fromId The sender id of the mail. Needs to be an existing user.
 * @param toId The receiver id of the mail. Needs to be an existing user.
 * @param body The body of the mail.
 * @param timestamp The mail creation timestamp.
 */
function Mail(from, to, subject, body){
  this.id = ++Mail.idCounter;
  this.from = from;
  this.to = to;
  this.subject = subject;
  this.body = body;
  this.timestamp = Date.now();

}

Mail.idCounter = 0;


const mailServer = {
  users: userDB,
  //dictionary indexed by userId. For each userId it contains the user's inbox.
  inboxes: {},

  /**
   * Adds a new mail to the inbox of the mailAddress in the mail.to field.
   * @param The mail to be added
   */
  addMail: function(mail){
    let mailAddress = mail.to;
    this.inboxes[mailAddress] = this.inboxes[mailAddress] || {}
    this.inboxes[mailAddress][mail.id]=mail;
  },

  /**
   * Deletes the mail with id: mailId from inbox of the user with mailAddress.
   * @param mailAddress the mail address of a user.
   * @param mailId the id of the mail to be deleted.
   */
  deleteMail: function(mailAddress, mailId){
    delete this.inboxes[mailAddress][mailId];
  },

 /**
  * Returns the inbox (the dictionary) indexed by mailAddress.
  * @param mailAddres the user mail address.
  */
  getInbox: function(mailAddress){
    return this.inboxes[mailAddress];
  },

  /**
   * Returns an array with all the mailAddress handled by the mail server.
   * example: ['pep@dom.com', 'mar@dom.com', 'nil@dom.com']
   */
  getAddressBook: function(){
    let i = 0;
    let addressBook = [];
    for(let mailAddress in this.users){
      addressBook.push(mailAddress);
    }
    return addressBook;
  },
}

//dummy mail server inboxes
mailServer.addMail(new Mail('pep@dom.com','mar@dom.com','Hi Mar', 'This is a test from pep to mar'));
mailServer.addMail(new Mail('pep@dom.com','nil@dom.com','Hi Nil', 'This is a test from pep to nil'));
mailServer.addMail(new Mail('mar@dom.com','pep@dom.com','Morning Pep', 'This is a test from mar to pep'));
mailServer.addMail(new Mail('mar@dom.com','nil@dom.com','Morning Nil', 'This is a test from mar to nil'));
mailServer.addMail(new Mail('nil@dom.com','pep@dom.com','By Pep', 'This is a test from nil to pep'));
mailServer.addMail(new Mail('nil@dom.com','mar@dom.com','By Mar', 'This is a test from nil to mar'));

module.exports={
  Mail, mailServer
}
