/*
Library homepage: https://github.com/Metafalica/background-size-emu

This library is result of my intellectual work.
I (the author, named Konstantin Izofatov, living in Russia, metafalica@gmx.com) grant you (the user) permissions
to use BgSzEmu.prototype library in any kind of projects (free, paid, etc) and modify it in any way.
However, it's forbidden to sell this library alone (as it is).	
	
This library provided "AS IS". I am not responsible for any damages that you can receive from using it.
Use it on your own risk.
	
This notice should not be removed.
*/

(function ()
{
    function BgSzEmu()
    {
        BgSzEmu.prototype.imageSizeCalculationModeIsBugged = true;
        BgSzEmu.prototype.elemsOnPrevCheck = null;
        //that gif from background-size-polyfill is sure shorter... but meh... it's not mine :P
        BgSzEmu.prototype.transparentSinglePixel = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwwAADsMBx2+oZAAAABh0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4zjOaXUAAAAA1JREFUGFdjYGBgYAAAAAUAAYoz4wAAAAAASUVORK5CYII=)";
    }

    BgSzEmu.prototype.scanElems = function ()
    {
        if (!BgSzEmu.prototype.IsIE() || !BgSzEmu.prototype.IsBadIE())
            return;

        if (document.body)
        {
            var curr_elems = new Array();
            BgSzEmu.prototype.getElemsIn(null, curr_elems);

            if (!BgSzEmu.prototype.elemsOnPrevCheck)
            {
                BgSzEmu.prototype.elemsOnPrevCheck = curr_elems.slice(0);
                BgSzEmu.prototype.activateBgSzFixer();
            }
            else
            {
                for (var i = 0; i < curr_elems.length; i++)
                    if (BgSzEmu.prototype.isObjectInArray(curr_elems[i], BgSzEmu.prototype.elemsOnPrevCheck))
                    {
                        if (!curr_elems[i].junkData)
                            continue;

                        var available_size = BgSzEmu.prototype.getAvailableAreaSizeIn(curr_elems[i], BgSzEmu.prototype.imageSizeCalculationModeIsBugged);

                        if (curr_elems[i].junkData.lastSize && (curr_elems[i].junkData.lastSize.width != available_size.width || curr_elems[i].junkData.lastSize.height != available_size.height))
                            BgSzEmu.prototype.fixBgFor(curr_elems[i]);
                    }
                    else
                    {
                        var curr_bg_img = curr_elems[i].style.backgroundImage || curr_elems[i].style.getAttribute("background-image");

                        if (curr_bg_img && !curr_elems[i].junkData)
                            BgSzEmu.prototype.fixBgFor(curr_elems[i]);
                    }

                BgSzEmu.prototype.elemsOnPrevCheck = curr_elems.slice(0);
            }
        }

        setTimeout(BgSzEmu.prototype.scanElems, 500);
    };

    BgSzEmu.prototype.activateBgSzFixer = function ()
    {
        if (!BgSzEmu.prototype.IsIE() || !BgSzEmu.prototype.IsBadIE())
            return;

        BgSzEmu.prototype.fixBgsRecursiveIn(null);
        window.onresize = BgSzEmu.prototype.handleResize;
    };

    BgSzEmu.prototype.fixBgsRecursiveIn = function (start_elem)
    {
        var curr_elem = start_elem ? start_elem : document.body;

        var bg_sz = curr_elem.style.backgroundSize || curr_elem.style.getAttribute("background-size");

        if (bg_sz)
            BgSzEmu.prototype.fixBgFor(curr_elem);

        for (var i = 0; i < curr_elem.children.length; i++)
            BgSzEmu.prototype.fixBgsRecursiveIn(curr_elem.children[i]);
    };

    BgSzEmu.prototype.handleResize = function ()
    {
        BgSzEmu.prototype.fixBgsRecursiveIn(null);
    };

    BgSzEmu.prototype.handlePropertyChange = function ()
    {
        var evt = window.event;
        var elem = evt.target || evt.srcElement;

        if (evt.propertyName == "onpropertychange" || !elem)
            return;

        if (evt.propertyName == "style.backgroundImage")
        {
            var bg_img = elem.style.backgroundImage || elem.style.getAttribute("background-image");

            if (BgSzEmu.prototype.stringContains(bg_img, BgSzEmu.prototype.transparentSinglePixel))
                return;
            else
                BgSzEmu.prototype.replaceBgImgFor(elem);
        }
        else if (BgSzEmu.prototype.startsWith(evt.propertyName, "style.background"))
            BgSzEmu.prototype.replaceBgImgFor(elem);
    };

    BgSzEmu.prototype.replaceBgImgFor = function (elem)
    {
        if (!BgSzEmu.prototype.elemCanHaveDivAsChildren(elem)) //can't deal with tags that do not support children
            return;
			
        var e_avl_sz = BgSzEmu.prototype.getAvailableAreaSizeIn(elem, BgSzEmu.prototype.imageSizeCalculationModeIsBugged)

        if (e_avl_sz.width == 0 || e_avl_sz.height == 0)
            return;			

        var prop_change_removed = false;

        if (elem.onpropertychange)
        {
            elem.onpropertychange = null;
            prop_change_removed = true;
        }

        var prev_backgroundImage = elem.style.backgroundImage || elem.style.getAttribute("background-image") || elem.background || elem.getAttribute("background");
        //var curr_backgroundSize = elem.style.backgroundSize || elem.style.getAttribute("background-size");

        if (BgSzEmu.prototype.stringContains(prev_backgroundImage, BgSzEmu.prototype.transparentSinglePixel))
        {
            BgSzEmu.prototype.fixBgFor(elem);

            if (prop_change_removed)
                elem.onpropertychange = BgSzEmu.prototype.handlePropertyChange;

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
                elem.onpropertychange = BgSzEmu.prototype.handlePropertyChange;

            return;
        }

        BgSzEmu.prototype.getImgNaturalSizeAndPassToCallback(elem, prev_backgroundImage, BgSzEmu.prototype.continueBgReplaceFor);
    };

    BgSzEmu.prototype.continueBgReplaceFor = function (elem, prev_backgroundImage, img_natural_size)
    {
        var prev_zIndex = elem.style.zIndex;
        var prev_position = elem.style.position;

        if (img_natural_size.width == 0 && img_natural_size.height == 0) //bad img url?
        {
            if (prop_change_removed)
                elem.onpropertychange = BgSzEmu.prototype.handlePropertyChange;

            return;
        }

        elem.style.backgroundImage = BgSzEmu.prototype.transparentSinglePixel;

        if ("background" in elem)
            elem.background = BgSzEmu.prototype.transparentSinglePixel;

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
        //div.style.border = "dashed";
        //img.style.border = "double";
        div.style.zIndex = img.style.zIndex = -1;
        div.style.display = img.style.display = "block";
        div.style.position = img.style.position = "absolute";
        div.style.visibility = img.style.visibility = "inherit";

        img.alt = "";
        img.src = BgSzEmu.prototype.getPurePathFrom(prev_backgroundImage);

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

        BgSzEmu.prototype.fixBgFor(elem);

        elem.onpropertychange = BgSzEmu.prototype.handlePropertyChange;
    };

    BgSzEmu.prototype.getImgNaturalSizeAndPassToCallback = function (elem, img_path, callback)
    {
        var pure_path = BgSzEmu.prototype.getPurePathFrom(img_path);

        var img = new Image();

        img.onload = function ()
        {
            var sz = { width: this.width, height: this.height };
            callback(elem, img_path, sz);
        };

        img.src = pure_path;
    };

    BgSzEmu.prototype.getAvailableAreaSizeIn = function (elem, get_elem_size_instead_of_inner_div)
    {
        var sz = null;

        if (get_elem_size_instead_of_inner_div || !elem.junkData)
            sz = { width: elem.clientWidth || elem.offsetWidth/* || elem.scrollWidth*/, height: elem.clientHeight || elem.offsetHeight/* || elem.scrollHeight*/ };
        else if (elem.junkData)
            sz = { width: elem.junkData.inner_div.offsetWidth, height: elem.junkData.inner_div.offsetHeight };

        return sz;
    };

    BgSzEmu.prototype.fixBgFor = function (elem)
    {
        var junkData = elem.junkData;
        var bg_sz = elem.style.backgroundSize || elem.style.getAttribute("background-size");

        if (junkData)
        {
            var available_size = BgSzEmu.prototype.getAvailableAreaSizeIn(elem, BgSzEmu.prototype.imageSizeCalculationModeIsBugged);
            var div_width = available_size.width;
            var div_height = available_size.height;
            var divRatio = div_width / div_height;

            elem.junkData.lastSize = available_size;

            if (BgSzEmu.prototype.imageSizeCalculationModeIsBugged)
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

            var elem_bg_pos = BgSzEmu.prototype.getElemBgPos(elem);

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

                if (t_width.toLowerCase() == "auto" && t_height.toLowerCase() == "auto")
                {
                    t_width = img_nat_width;
                    t_height = img_nat_height;
                }
                else if (t_width.toLowerCase() == "auto")
                {
                    elem.junkData.inner_img.style.height = t_height;
                    var just_set_height = elem.junkData.inner_img.clientHeight || elem.junkData.inner_img.offsetHeight/* || elem.junkData.inner_img.scrollHeight*/;
                    var width_to_set = (img_nat_width * just_set_height) / img_nat_height;

                    if (!width_to_set || width_to_set < 1)
                        width_to_set = 1;

                    elem.junkData.inner_img.width = width_to_set;
                }
                else if (t_height.toLowerCase() == "auto")
                {
                    elem.junkData.inner_img.style.width = t_width;
                    var just_set_width = elem.junkData.inner_img.clientWidth || elem.junkData.inner_img.offsetWidth/* || elem.junkData.inner_img.scrollWidth*/;
                    var height_to_set = (just_set_width * img_nat_height) / img_nat_width;

                    if (!height_to_set || height_to_set < 1)
                        height_to_set = 1;

                    elem.junkData.inner_img.height = height_to_set;
                }
                else
                {
                    elem.junkData.inner_img.style.width = t_width;
                    elem.junkData.inner_img.style.height = t_height;
                }

                elem.junkData.inner_img.style.left = elem_bg_pos.h_pos.is_percents ? Math.floor((div_width - elem.junkData.inner_img.width) * elem_bg_pos.h_pos.value) + "px" : elem_bg_pos.h_pos.value;
                elem.junkData.inner_img.style.top = elem_bg_pos.v_pos.is_percents ? Math.floor((div_height - elem.junkData.inner_img.height) * elem_bg_pos.v_pos.value) + "px" : elem_bg_pos.v_pos.value;
            }
        }
        else if (bg_sz)
            BgSzEmu.prototype.replaceBgImgFor(elem);
    };

    BgSzEmu.prototype.parseBgPosVal = function (word)
    {
        var map = new Array();
        map["left"] = "0.0";
        map["center"] = "0.5";
        map["right"] = "1.0";
        map["top"] = "0.0";
        map["bottom"] = "1.0";

        if (word in map)
            return { value: map[word], is_percents: true };
        else if (BgSzEmu.prototype.endsWith(word, "%"))
            return { value: (word.substr(0, word.length - 1) / 100), is_percents: true };

        return { value: word, is_percents: false };
    };

    //common functions
    BgSzEmu.prototype.IsIE = function ()
    {
        return navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;
    };

    BgSzEmu.prototype.IsBadIE = function ()
    {
        return "attachEvent" in window && !("addEventListener" in window); //detects ie < 9 and ie9 in quirks mode
    };

    BgSzEmu.prototype.getElemsIn = function (start_elem, curr_elems)
    {
        var curr_elem = start_elem ? start_elem : document.body;

        for (var i = 0; i < curr_elem.children.length; i++)
        {
            curr_elems.push(curr_elem.children[i]);
            BgSzEmu.prototype.getElemsIn(curr_elem.children[i], curr_elems);
        }
    };

    BgSzEmu.prototype.getPurePathFrom = function (str_path)
    {
        var final_str = str_path;

        if (final_str.substring(0, ("url(").length) == "url(")
        {
            final_str = final_str.substr(4);

            if (final_str.lastIndexOf(")") == final_str.length - 1)
                final_str = final_str.substr(0, final_str.length - 1);
        }

        return final_str;
    };

    BgSzEmu.prototype.getElemBgPos = function (elem)
    {
        var bg_pos = elem.style.backgroundPosition || elem.style.getAttribute("background-position");

        if (bg_pos)
        {
            var splitted_pos = bg_pos.split(" ");
            var h_pos_ = (splitted_pos[0] ? BgSzEmu.prototype.parseBgPosVal(splitted_pos[0]) : "0%");
            var v_pos_ = (splitted_pos[1] ? BgSzEmu.prototype.parseBgPosVal(splitted_pos[1]) : "0%");

            return { h_pos: h_pos_, v_pos: v_pos_ };
        }
        else
            return { h_pos: { value: "0", is_percents: true }, v_pos: { value: "0", is_percents: true} };
    };

    BgSzEmu.prototype.stringContains = function (str, suffix)
    {
        if (!str)
            return false;

        return str.indexOf(suffix) > -1;
    };

    BgSzEmu.prototype.startsWith = function (str, suffix)
    {
        if (!str)
            return false;

        return str.substring(0, suffix.length) === suffix;
    };

    BgSzEmu.prototype.endsWith = function (str, suffix)
    {
        if (!str)
            return false;

        return str.indexOf(suffix, str.length - suffix.length) >= 0;
    };

    BgSzEmu.prototype.isObjectInArray = function (obj, arr)
    {
        for (var i = 0; i < arr.length; i++)
            if (arr[i] == obj)
                return true;

        return false;
    };

    BgSzEmu.prototype.elemCanHaveDivAsChildren = function (elem)
    {
        if (elem.tagName.toLowerCase() == "tr") //hacky avoid of elemens that will become bugged after adding div
            return false;

        if (!BgSzEmu.prototype.imageSizeCalculationModeIsBugged && elem.tagName.toLowerCase() == "table") //not supported in right mode.
            return false;

        var div = document.createElement("div");
        div.style.display = "none";
        var check_result = true;

        try { elem.appendChild(div); }
        catch (exc) { check_result = false; }
        finally
        {
            if (BgSzEmu.prototype.isObjectInArray(div, elem.children))
                elem.removeChild(div);
        }

        return check_result;
    };
    //common functions end

    var bg_sz_emu = new BgSzEmu();
    bg_sz_emu.scanElems();
})();