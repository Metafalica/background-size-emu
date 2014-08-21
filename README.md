background-size-emu
===================

Emulate background-size for IE6, IE7, IE8 and IE9 in quirks mode.

I suffered to much from IE8 not supporting it and decided to change that.
Then I accidentaly run into https://github.com/louisremi/background-size-polyfill project that adds support of background-size via adding -ms-behavior: url(/backgroundsize.min.htc); into element together with background-size.

Sadly, it didn't worked in some cases, like IE8 in quirks mode. Also, also, I though that htc solution were very uncomfortable.

I decided to write own *.js library that would be much simplier to use, via simple referencing lib.

I TELLING EVERYONE that I used IDEAS from background-size-polyfill, but coded EVERYTHING in my own way, so you can't really tell that I stole someones code. My code is similar to background-size-polyfill code in around 10% (algorithm for inner image position calculation).

Now I ready to share that lib with everyone.

HOW TO SETUP:

Simply add `<script type = "text/javascript" src = "background_size_emu.js"></script>` to your page and it will solve all problems for you!

HOW IT WORKS:

It periodically scans for DOM elements changes and if element with background-size found, it inserts into it DIV with IMG inside.
It reacts to window resizes and fix image size.

WHAT IT CAN AND WHAT IT CAN'T:

It can work in two modes - "the right one" and "the bugged one".
The difference is...
"The right one" works for TD and DIV only (if background-size set for that elements)
"The bugged one" works for most elements that can have children (P, SPAN, TABLE, TD, other not tested by me) and not work for TR. And... why it bugged? Oh... huh... well... you see this and that... Better to use "right one" if you planning to set background-size for DIVs and TDs only.

The default mode is bugged one.
To switch modes - open `background_size_emu.js` in text editor, search for `/*Line 1:*/`, read some text 4 lines upper than found line and decide what to do.

For some unknown for me reasons, if P display property is not set to `inline`, the background image appears in it's middle :O

It can check at startup IE version and disable self if it IE >= 9. However, it will not disable self if IE9 in quirks mode (also no support for `background-size`)

It can't emulate background-size for elemets that can't have children and TR in any modes.
It does not support background-repeat, so only single image is placed in target element
