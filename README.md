# Mastodon – Simplified Federation!

Simplifies following or interacting with other users on remote instances. Basically, it skips the "Enter your Mastodon handle" interface and takes you directly to your own "home" instance, when you click on a "Follow" button or a reply/retoot/fav button on another instance. :smile:

[Idea by](https://social.wxcafe.net/@akkes/100550833588126733) [@akkes](https://social.wxcafe.net/@akkes).

### Why?

You may wonder why to use this browser add-on. But actually, it's easy!

You do not need to enter your Mastodon account handle anymore! (except for login :wink:) This makes interacting with remote instances much simpler.

Additionally, this add-on makes sure to keep your Mastodon handle **private**. It will never expose it into any third-party site. As such, e.g., it does not – literally – enter your Mastodon ID into the input field you normally see, but basically "skips" this page. For the technical details, on how this works, see [How does it work?](#how-does-it-work) below.

### How does it work?

* it intercepts any remote interaction popup/request
* it tries to get the toot/account you want to interact with from the "Enter your Mastodon ID" popup
  * for remote follows: It get's the account to follow from the URL
  * for toot interactions: Currently it has to grab the toot URL the interaction is about from the HTML page
* Afterwards it then redirects to the "remote_follow"/"remote_interaction" endpoint of your own Mastodon instance directly, thus skipping entering the Mastodon handle in that "foreign" page.

## Download

**[![Get it for Firefox!](assets/amobutton.png)](https://addons.mozilla.org/de/firefox/addon/mastodon-simplified-federation)**

## Support development

You can support the development of this add-on on Liberapay:  
[![Donate using Liberapay](https://liberapay.com/assets/widgets/donate.svg)](https://liberapay.com/rugk/donate)
