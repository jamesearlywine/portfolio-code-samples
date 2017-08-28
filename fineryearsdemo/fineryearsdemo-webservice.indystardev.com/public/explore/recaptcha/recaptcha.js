/* global jQuery, grecaptcha */

// get script location (for loading modal.html as relative to script location)
var recaptcha_scripts   = document.getElementsByTagName('script');
var recaptcha_path      = recaptcha_scripts[recaptcha_scripts.length-1].src.split('?')[0];      // remove any ?query
var recaptcha_basepath  = recaptcha_path.split('/').slice(0, -1).join('/')+'/';  // remove last filename part of path


/**
 * Wrapper for the Google Recaptcha Library to simplify implementation
 * (exposes fluent interface)
 */
window.recaptcha = {
    
    settings : {
        // default values (can be overriden with fluent mutator methods below)
        siteKey         : '6Le0YSETAAAAAJ_5QTo-A547jJQcqToI6eIaRHGF',
        theme           : 'light', // valid values are 'light' and 'dark' - https://developers.google.com/recaptcha/docs/faq#can-i-customize-the-recaptcha-widget
    
        // primarily for internal use
        elementId       : null,
        element         : null,
        recaptcha       : null,
        isReady         : false,
        responseToken   : null,
        retryDelay      : 200, // if recaptcha is not ready, try again to insert captcha in XXX milliseconds
        scriptLocation  : null,
        formId          : null
    },
    
    // ** fluent interface setters ** //
    inElementId : function(id) 
    {
        this.settings.elementId = id;
        return this;
    },
    inElement : function(element) 
    {
        this.settings.element = element;
        return this;
    },
    withSiteKey : function(siteKey) 
    {
        this.settings.siteKey = siteKey;
        return this;
    },
    withTheme   : function(theme)
    {
        this.settings.theme = theme;
        return this;
    },
    forFormId   : function(formId) {
        this.settings.formId = formId.replace(/#/g, '');
        return this;
    },
    // ** fluent interface getters ** //
    isReady : function()
    {
        return this.settings.isReady;
    },
    getRecaptcha : function() 
    {
        return this.settings.recaptcha;
    },
    getResponseToken : function() 
    {
        return this.settings.responseToken;  
    },
    
    /**
     * insert the recaptcha if the library has loaded
     * ..otherwise try again after a delay (polling function)
     */
    insertRecaptcha : function() 
    {
        // if recaptcha has been initialized
        if (this.settings.isReady) {
            // insert the captcha
            this._insertRecaptcha();
        } else { // otherwise
            // try again in XXXms
            setTimeout(function() {
                // console.log('trying again');
                this.insertRecaptcha();
            }.bind(this), this.settings.retryDelay)
        }
        
    },
    _insertRecaptcha : function() 
    {
        if (this.settings.element === null) {
            var element = jQuery('#' + this.settings.elementId.replace(/#/g, ''))[0];    
        } else {
            var element = this.settings.element;
        }
        
        jQuery(element).empty().html('');
        
        this.settings.recaptcha = 
            grecaptcha.render(
                element,
                {
                    'sitekey'   : this.settings.siteKey,
                    'callback'  : this.recaptchaCallback,
                    'theme'     : this.settings.theme
                }
            )
        ;
    },
    modalRecaptcha : function() 
    {
        // if recaptcha has been initialized
        if (this.settings.isReady) {
            // insert the captcha
            this._modalRecaptcha();
        } else { // otherwise
            // try again in XXXms
            setTimeout(function() {
                // console.log('trying again');
                this.modalRecaptcha();
            }.bind(this), this.settings.retryDelay)
        }
    },
    _modalRecaptcha : function() 
    {
        // load the recaptcha modal and append it to body
        jQuery('body').append('<div id="jle-recaptcha-modal-container"></div>')
        jQuery('#jle-recaptcha-modal-container').load(recaptcha_basepath + 'modal.html', function() {
            // show the modal
            jQuery('#recaptcha-modal').modal({ keyboard: false}, 'show');
            // insert the captcha
            this.inElement( jQuery('#jle-recaptcha-modal-container #modal-recaptcha-container')[0] )
                ._insertRecaptcha()
            ;    
        }.bind(this));
        
    },
    // google recaptcha library-loaded callback
    initialize : function() 
    {
        // console.log('library loaded');
        this.settings.isReady = true;
        return this;
    },

    // ** handle recaptcha response ** //
    recaptchaDefaultCallback : function(response)
    {
        // console.log('recaptcha response token: ', response);
        this.settings.responseToken = response;
    },
    recaptchaCallback : function(response) {
        return window.recaptcha.recaptchaDefaultCallback(response);
    },
    /**
     * Define a custom callback using an anonymous delegate function
     * callback function must accept the response variables
     * ..which contains the recaptcha response token to verify server-side
     */
    withCallback : function(callback) 
    {
        this.recaptchaCallback = function(response) {
            window.recaptcha.recaptchaDefaultCallback(response);
            callback(response);
        }.bind(this);
        return this;
    },
    
    /**
     * Submit a form, with recaptchaResponseToken inserted as a hidden field
     * - recaptchaResponseToken is optional - if omitted, will use the last responseToken received
     */
    submitFormWithRecaptchaResponseToken : function(recaptchaResponseToken, formId)
    {
        if (formId === undefined) {
            formId = recaptchaResponseToken;
            recaptchaResponseToken = this.settings.responseToken;
        }
        
        // close the modal
        this.closeModal();
        
        // insert the recaptchaResponseToken into the form
        jQuery('<input>').attr({
            type    : 'hidden',
            id      : 'g-recaptcha-response',
            name    : 'g-recaptcha-response',
            value   :  recaptchaResponseToken 
        }).appendTo('#' + formId);
        // submit the form (using the native submit, so as not to re-trigger the captcha prompt)
        jQuery('#' + formId)[0].submit();
        
    },
    closeModal: function() {
      jQuery('#recaptcha-modal').modal('hide');
      return this;
    },
    submitHandler   : function(event) {
        // console.log('submitHandler context this: ', this);
        event.preventDefault();
        window.recaptcha
            .withSiteKey(this.settings.siteKey)
            .withCallback(function(recaptchaResponseToken) {
                // debug info
                console.log('Recaptcha Response Token (to be submitted with form data): ', recaptchaResponseToken);
                // after the user responds, submit theForm with recaptcha_response_token included
                window.recaptcha.submitFormWithRecaptchaResponseToken(this.settings.formId);
            }.bind(this))
            .modalRecaptcha()
        ;      
        return false;
    },
    requireRecaptcha  : function(params) {
        if (params !== undefined) {
            if (params.formId !== undefined) {
                this.withFormId(params.formId);
            }
            if (params.siteKey !== undefined) {
                this.withSiteKey(params.siteKey);
            }
        }
        jQuery('#' + this.settings.formId).bind('submit', this.submitHandler.bind(this));
        
    },
    
    
    
};

/**
 * Google Recaptcha onload callback function 
 * (must be defined in the global space, see the script tag)
 */
function recaptchaInitialized() {
    window.recaptcha.initialize();
}