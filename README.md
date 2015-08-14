<b>background-size-emu readme<br />===================<br />The JS library that emulates background-size for IE6, IE7, IE8 and IE9 in quirks mode.</b><br />
<br />
<b>Description:</b><br />
I suffered to much from IE8 not supporting background-size and decided to change that.<br />
Then I accidentally run into <a href = "https://github.com/louisremi/background-size-polyfill">https://github.com/louisremi/background-size-polyfill</a> project, that adds support of background-size via adding <b>-ms-behavior: url(/backgroundsize.min.htc);</b> into element together with <b>background-size</b>.<br />
Sadly, it didn't worked in some cases, like IE8 in quirks mode. Also, I though that <b>htc</b> solution were very uncomfortable.<br />
<br />
I decided to write own *.js library that would be much simpler to use, via referencing lib.<br />
I TELLING EVERYONE that I used IDEAS from background-size-polyfill, but coded EVERYTHING in my own way, so you can't really tell that I stole someone's code. My code is similar to background-size-polyfill code in around 10% (algorithm for inner image position calculation).<br />
<br />
Now I ready to share that lib with everyone.<br />
<br />
<b>How to setup:</b><br />
Simply add <i>&lt;script type = "text/javascript" src = "background_size_emu.js"&gt;&lt;/script&gt;</i> to your page and it will solve all problems for you!<br />
<br />
<b>How it works:</b><br />
It periodically scans for DOM elements changes and, if element with background-size found, it inserts into it DIV with IMG inside.<br />
It reacts to window resizes and fix image size.<br />
It reacts for elements sizes changes, without window size change<br />
<br />
<b>How it works:</b><br />
It periodically scans for DOM elements changes and if element with background-size found, it inserts DIV with IMG inside into it.<br />
It reacts to window resizes and fix image size.<br />
It reacts for elements sizes changes, without window size change<br />
<br />
<b>Library possibilities:</b><br />
It can check IE version and disable self if it IE >= 9. However, it will not disable self if IE9 in quirks mode (also no support for <b>background-size</b>).<br />
It support element dynamic size changes (when no page resize event is fired).<br />
It support body as background target.<br />
P.S. For some unknown for me reasons, if P display property is not set to <b>inline</b>, the background image appears in it's middle :O<br />
<br />
<font color = "red">It can't emulate background-size for elements that can't have children and TR.</font><br />
It does not support background-repeat, so only single image is placed in target element.<br />
<br />
<b>Links:</b><br />
Project page: <a href = "http://bg-sz-emu.somee.com">http://bg-sz-emu.somee.com</a><br />
Live demo page (view in IE6 - IE8): <a href = "http://bg-sz-emu.somee.com/test.html">http://bg-sz-emu.somee.com/test.html</a><br />
Supported elements page (view in IE6 - IE8): <a href = "http://bg-sz-emu.somee.com/supported_elements.html">http://bg-sz-emu.somee.com/supported_elements.html</a><br />
<br />
<b>Donations:</b><br />
If you found my library useful and it saved your time and efforts, please, consider donating me something. Even 1 USD is fine :O<br />
You know that... <b>gathering by single yarn from everyone can make the dress for poor one.</b><br />
<a href = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=metafalica%40gmx%2ecom&lc=US&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted">Donate with Paypal</a>
