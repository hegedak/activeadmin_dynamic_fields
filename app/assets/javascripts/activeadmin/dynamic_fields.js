
function dfEvalCondition( el, args ) {
  if( args.fn ) {
    if( args.fn && window[args.fn] ) return !window[args.fn]( el );
    else console.log( 'Warning - activeadmin_dynamic_fields: ' + args.fn + '() not available [1]' );
  }
  else if( args.if == 'checked' ) {
    return !el.is(':checked');
  }
  else if( args.if == 'not_checked' ) {
    return el.is(':checked');
  }
  else if( args.if == 'blank' ) {
    return el.val().length === 0 || !el.val().trim();
  }
  else if( args.if == 'not_blank' ) {
    return el.val().length !== 0 && el.val().trim();
  }
  else if( args.eq ) {
    return el.val() == args.eq;
  }
  else if( args.not ) {
    return el.val() != args.not;
  }
  return undefined;
}

function dfSetupField( el ) {
  var action = el.data( 'action' );
  var target, args = {};
  args.if = el.data( 'if' );
  args.eq = el.data( 'eq' );
  args.not = el.data( 'not' );
  args.fn = el.data( 'function' );
  if( el.data( 'target' ) ) target = el.closest( 'fieldset' ).find( el.data( 'target' ) )
  if( action == 'hide' ) {
    if( dfEvalCondition( el, args ) ) target.show();
    else target.hide();
    el.on( 'change', function( event ) {
      if( dfEvalCondition( $(this), args ) ) target.show();
      else target.hide();
    });
  }
  else if( action == 'slide' ) {
    if( dfEvalCondition( el, args ) ) target.slideDown();
    else target.slideUp();
    el.on( 'change', function( event ) {
      if( dfEvalCondition( $(this), args ) ) target.slideDown();
      else target.slideUp();
    });
  }
  else if( action == 'fade' ) {
    if( dfEvalCondition( el, args ) ) target.fadeIn();
    else target.fadeOut();
    el.on( 'change', function( event ) {
      if( dfEvalCondition( $(this), args ) ) target.fadeIn();
      else target.fadeOut();
    });
  }
  else if( action == 'setValue' ) {
    var val = el.data( 'value' ) ? el.data( 'value' ) : '';
    if( dfEvalCondition( el, args ) ) dfSetValue( target, val );
    el.on( 'change', function( event ) {
      if( dfEvalCondition( $(this), args ) ) dfSetValue( target, val );
    });
  }
  else if( action == 'callback' ) {
    var cb = el.data( 'callback' );
    if( cb && window[cb] ) {
      if( dfEvalCondition( el, args ) ) window[cb]( el.data( 'args' ) );
      el.on( 'change', function( event ) {
        if( dfEvalCondition( $(this), args ) ) window[cb]( el.data( 'args' ) );
      });
    }
    else console.log( 'Warning - activeadmin_dynamic_fields: ' + cb + '() not available [2]' );
  }
  else if( args.fn ) {  // function without action
    dfEvalCondition( el, args );
    el.on( 'change', function( event ) {
      dfEvalCondition( el, args );
    });
  }
}

function dfSetValue( el, val ) {
  if( el.attr('type') != 'checkbox' ) el.val( val );
  else el.prop('checked', val == '1');
  el.trigger( 'change' );
}

$(document).ready( function() {
  $('.active_admin [data-df-dialog]').on( 'click', function( event ) {
    event.preventDefault();
    if( $('#df-dialog').length == 0 ) $('body').append( '<div id="df-dialog"></div>' );
    var title = $(this).attr( 'title' );
    $.ajax({
      url: $(this).attr( 'href' )
    }).done( function( result ) {
      if( title ) $('#df-dialog').attr( 'title', title );
      $('#df-dialog').html( result );
      $('#df-dialog').dialog({ modal: true });
    });
  });

  $('.active_admin .input [data-if], .active_admin .input [data-function], .active_admin .input [data-eq], .active_admin .input [data-not]').each( function() {
    dfSetupField( $(this) );
  });

  $('.active_admin .has_many_container').on( 'has_many_add:after', function( e, fieldset, container ) {
    $('.active_admin .input [data-if], .active_admin .input [data-function], .active_admin .input [data-eq], .active_admin .input [data-not]').each( function() {
      dfSetupField( $(this) );
    });
  });
});
