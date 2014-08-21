/*
	Library homepage: https://github.com/Metafalica/background-size-emu

	This library is result of my intellectual work.
	I (the author, named Konstantin Izofatov, living in Russia, metafalica@gmx.com) grant you (the user) permissions
	to use this library in any kind of projects (free, paid, etc) and modify it in any way.
	However, it's forbidden to sell this library alone.	
	This notice should not be removed.
*/

var imageSizeCalculationModeIsBugged = true;
var elemsOnPrevCheck = null;
//that gif from background-size-polyfill is sure shorter... but meh... it's not mine :P
var transparentSinglePixel = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4zjOaXUAAAAA1JREFUGFdjYGBgYAAAAAUAAYoz4wAAAAAASUVORK5CYII=)";
scanElems();

function scanElems()
{
    if (!IsIE() || !IsBadIE())
        return;

    if (document.body)
    {
        var curr_elems = new Array();
        getElemsIn(null, curr_elems);

        if (!elemsOnPrevCheck)
        {
            elemsOnPrevCheck = curr_elems.slice(0);
            activateBgSzFixer();
        }
        else
        {
            for (var i = 0; i < curr_elems.length; i++)
                if (isObjectInArray(curr_elems[i], elemsOnPrevCheck))
                {
                    if (!curr_elems[i].junkData)
                        continue;

                    var available_size = getAvailableAreaSizeIn(curr_elems[i], imageSizeCalculationModeIsBugged);

                    if (curr_elems[i].junkData.lastSize && (curr_elems[i].junkData.lastSize.width != available_size.width || curr_elems[i].junkData.lastSize.height != available_size.height))
                        fixBgFor(curr_elems[i]);
                }
                else
                {
                    var curr_bg_img = curr_elems[i].style.backgroundImage || curr_elems[i].style.getAttribute("background-image");

                    if (curr_bg_img && !curr_elems[i].junkData)
                        fixBgFor(curr_elems[i]);
                }

            elemsOnPrevCheck = curr_elems.slice(0);
        }
    }

    setTimeout(scanElems, 500);
}

function activateBgSzFixer()
{
    if (!IsIE() || !IsBadIE())
        return;

    fixBgsRecursiveIn(null);
    window.onresize = handleResize;
}

function fixBgsRecursiveIn(start_elem)
{
    var curr_elem = start_elem ? start_elem : document.body;

    var bg_sz = curr_elem.style.backgroundSize || curr_elem.style.getAttribute("background-size");

    if (bg_sz)
        fixBgFor(curr_elem);

    for (var i = 0; i < curr_elem.children.length; i++)
        fixBgsRecursiveIn(curr_elem.children[i]);
}

function handleResize()
{
    fixBgsRecursiveIn(null);
}

function handlePropertyChange()
{
    var evt = window.event;
    var elem = evt.target || evt.srcElement;

    if (evt.propertyName == "onpropertychange" || !elem)
        return;

    if (evt.propertyName == "style.backgroundImage")
    {
        var bg_img = elem.style.backgroundImage || elem.style.getAttribute("background-image");

        if (stringContains(bg_img, transparentSinglePixel))
            return;
        else
            replaceBgImgFor(elem);
    }
    else if (startsWith(evt.propertyName, "style.background"))
        replaceBgImgFor(elem);
}

function replaceBgImgFor(elem)
{
    if (!elemCanHaveDivAsChildren(elem)) //can't deal with tags that do not support children
        return;

    var prop_change_removed = false;

    if (elem.onpropertychange)
    {
        elem.onpropertychange = null;
        prop_change_removed = true;
    }

    var prev_backgroundImage = elem.style.backgroundImage || elem.style.getAttribute("background-image");
    //var curr_backgroundSize = elem.style.backgroundSize || elem.style.getAttribute("background-size");

    if (stringContains(prev_backgroundImage, transparentSinglePixel))
    {
        fixBgFor(elem);

        if (prop_change_removed)
            elem.onpropertychange = handlePropertyChange;

        return;
    }

    if (!prev_backgroundImage)
    {
        if (elem.junkData)
        {
            elem.removeChild(elem.junkData.inner_div);
            elem.style.position = elem.junkData.orig_pos;
            elem.style.zIndex = elem.junkData.orig_zInd;
            elem.junkData = null;
        }

        if (prop_change_removed)
            elem.onpropertychange = handlePropertyChange;

        return;
    }

    getImgNaturalSizeAndPassToCallback(elem, prev_backgroundImage, continueBgReplaceFor);
}

function continueBgReplaceFor(elem, prev_backgroundImage, img_natural_size)
{
    var prev_zIndex = elem.style.zIndex;
    var prev_position = elem.style.position;

    if (img_natural_size.width == 0 && img_natural_size.height == 0) //bad img url?
    {
        if (prop_change_removed)
            elem.onpropertychange = handlePropertyChange;

        return;
    }

    elem.style.backgroundImage = transparentSinglePixel;

    if (!elem.style.position || elem.style.position == "static")
        elem.style.position = "relative";

    if (!elem.style.zIndex || elem.style.zIndex == "auto")
        elem.style.zIndex = 0;

    var div = document.createElement("div");
    var img = document.createElement("img");

    div.style.margin = 0;
    div.style.top = "0px";
    div.style.left = "0px";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.overflow = "hidden";
    //div.style.border = "double";
    div.style.zIndex = img.style.zIndex = -1;
    div.style.display = img.style.display = "block";
    div.style.position = img.style.position = "absolute";
    div.style.visibility = img.style.visibility = "inherit";

    img.alt = "";
    img.src = getPurePathFrom(prev_backgroundImage);

    if (elem.junkData)
    {
        elem.removeChild(elem.junkData.inner_div);
        elem.junkData = null;
    }

    var junkData = { orig_bgImg: prev_backgroundImage, orig_pos: prev_position, orig_zInd: prev_zIndex, inner_div: div, inner_img: img, inner_img_nat_size: img_natural_size };
    elem.junkData = junkData;

    div.appendChild(img);

    if (elem.firstChild)
        elem.insertBefore(div, elem.firstChild);
    else
        elem.appendChild(div);

    fixBgFor(elem);

    elem.onpropertychange = handlePropertyChange;
}

function getImgNaturalSizeAndPassToCallback(elem, img_path, callback)
{
    var pure_path = getPurePathFrom(img_path);

    var img = new Image();

    img.onload = function ()
    {
        var sz = { width: this.width, height: this.height };
        callback(elem, img_path, sz);
    };

    img.src = pure_path;
}

function getAvailableAreaSizeIn(elem, get_elem_size_instead_of_inner_div)
{
    var sz = null;

    if (get_elem_size_instead_of_inner_div || !elem.junkData)
        sz = { width: elem.clientWidth || elem.offsetWidth || elem.scrollWidth, height: elem.clientHeight || elem.offsetHeight || elem.scrollHeight };
    else if (elem.junkData)
        sz = { width: elem.junkData.inner_div.offsetWidth, height: elem.junkData.inner_div.offsetHeight };

    return sz;
}

function fixBgFor(elem)
{
    var junkData = elem.junkData;
    var bg_sz = elem.style.backgroundSize || elem.style.getAttribute("background-size");

    if (junkData)
    {
        var available_size = getAvailableAreaSizeIn(elem, imageSizeCalculationModeIsBugged);
        var div_width = available_size.width;
        var div_height = available_size.height;
        var divRatio = div_width / div_height;

        elem.junkData.lastSize = available_size;

        if (imageSizeCalculationModeIsBugged)
        {
            junkData.inner_div.style.width = div_width + "px";
            junkData.inner_div.style.height = div_height + "px";
        }

        var img_nat_width = junkData.inner_img_nat_size.width;
        var img_nat_height = junkData.inner_img_nat_size.height;
        var img_curr_width = junkData.inner_img.width || junkData.inner_img.style.width;
        var img_curr_height = junkData.inner_img.height || junkData.inner_img.style.height;
        var imgRatio = (img_curr_width / img_curr_height) || (img_nat_width / img_nat_height);

        var new_img_top = "0px";
        var new_img_left = "0px";
        var new_img_width;
        var new_img_height;

        var elem_bg_pos = getElemBgPos(elem);

        if (bg_sz == "cover" || bg_sz == "contain")
        {
            if ((bg_sz == "cover" && divRatio > imgRatio) || (bg_sz == "contain" && imgRatio > divRatio))
            {
                new_img_width = div_width;
                new_img_height = (new_img_width * img_nat_height) / img_nat_width;

                if (elem_bg_pos.v_pos.is_percents)
                    new_img_top = Math.floor((div_height - div_width / imgRatio) * elem_bg_pos.v_pos.value) + "px";
            }
            else
            {
                new_img_height = div_height;
                new_img_width = (img_nat_width * new_img_height) / img_nat_height;

                if (elem_bg_pos.h_pos.is_percents)
                    new_img_left = Math.floor((div_width - div_height * imgRatio) * elem_bg_pos.h_pos.value) + "px";
            }

            //var img_width_diff = Math.abs(div_width - new_img_width);
            //var img_height_diff = Math.abs(div_height - new_img_height);

            //var pos_fixer = (bg_sz == "cover" ? -1 : 1);
            elem.junkData.inner_img.width = new_img_width;
            elem.junkData.inner_img.height = new_img_height;
            //elem.junkData.inner_img.style.left = (pos_fixer * (0 + (img_width_diff / 2))) + "px";
            //elem.junkData.inner_img.style.top = (pos_fixer * (0 + (img_height_diff / 2))) + "px";

            elem.junkData.inner_img.style.left = elem_bg_pos.h_pos.is_percents ? new_img_left : elem_bg_pos.h_pos.value;
            elem.junkData.inner_img.style.top = elem_bg_pos.v_pos.is_percents ? new_img_top : elem_bg_pos.v_pos.value;
        }
        else
        {
            var splitted_size = bg_sz.split(" ");
            var t_width = splitted_size[0];
            var t_height = splitted_size[1];

            elem.junkData.inner_img.style.width = t_width;
            elem.junkData.inner_img.style.height = t_height;

            elem.junkData.inner_img.style.left = elem_bg_pos.h_pos.is_percents ? Math.floor((div_width - elem.junkData.inner_img.width) * elem_bg_pos.h_pos.value) + "px" : elem_bg_pos.h_pos.value;
            elem.junkData.inner_img.style.top = elem_bg_pos.v_pos.is_percents ? Math.floor((div_height - elem.junkData.inner_img.height) * elem_bg_pos.v_pos.value) + "px" : elem_bg_pos.v_pos.value;
        }
    }
    else if (bg_sz)
        replaceBgImgFor(elem);
}

function parseBgPosVal(word)
{
    var map = new Array();
    map["left"] = "0.0";
    map["center"] = "0.5";
    map["right"] = "1.0";
    map["top"] = "0.0";
    map["bottom"] = "1.0";

    if (word in map)
        return { value: map[word], is_percents: true };
    else if (endsWith(word, "%"))
        return { value: (word.substr(0, word.length - 1) / 100), is_percents: true };

    return { value: word, is_percents: false };
}

//common functions
function IsIE()
{
    return navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;
}

function IsBadIE()
{
    return "attachEvent" in window && !("addEventListener" in window); //detects ie < 9 and ie9 in quirks mode
}

function getElemsIn(start_elem, curr_elems)
{
    var curr_elem = start_elem ? start_elem : document.body;

    for (var i = 0; i < curr_elem.children.length; i++)
    {
        curr_elems.push(curr_elem.children[i]);
        getElemsIn(curr_elem.children[i], curr_elems);
    }
}

function getPurePathFrom(str_path)
{
    var final_str = str_path;

    if (final_str.substring(0, ("url(").length) == "url(")
    {
        final_str = final_str.substr(4);

        if (final_str.lastIndexOf(")") == final_str.length - 1)
            final_str = final_str.substr(0, final_str.length - 1);
    }

    return final_str;
}

function getElemBgPos(elem)
{
    var bg_pos = elem.style.backgroundPosition || elem.style.getAttribute("background-position");

    if (bg_pos)
    {
        var splitted_pos = bg_pos.split(" ");
        var h_pos_ = (splitted_pos[0] ? parseBgPosVal(splitted_pos[0]) : "0%");
        var v_pos_ = (splitted_pos[1] ? parseBgPosVal(splitted_pos[1]) : "0%");

        return { h_pos: h_pos_, v_pos: v_pos_ };
    }
    else
        return { h_pos: "0%", v_pos: "0%" };
}

function stringContains(str, suffix)
{
    if (!str)
        return false;

    return str.indexOf(suffix) > -1;
}

function startsWith(str, suffix)
{
    if (!str)
        return false;

    return str.substring(0, suffix.length) === suffix;
}

function endsWith(str, suffix)
{
    if (!str)
        return false;

    return str.indexOf(suffix, str.length - suffix.length) >= 0;
}

function isObjectInArray(obj, arr)
{
    for (var i = 0; i < arr.length; i++)
        if (arr[i] == obj)
            return true;

    return false;
}

function elemCanHaveDivAsChildren(elem)
{
    if (elem.tagName.toLowerCase() == "tr") //hacky avoid of elemens that will become bugged after adding div
        return false;

    var div = document.createElement("div");
    div.style.display = "none";
    var check_result = true;

    try { elem.appendChild(div); }
    catch (exc) { check_result = false; }
    finally
    {
        if (isObjectInArray(div, elem.children))
            elem.removeChild(div);
    }

    return check_result;
}
//common functions end