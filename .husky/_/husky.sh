#!/usr/bin/env sh
if [ -z "$husky" ] ; then
  debug () {
    [ "${HUSKY_DEBUG}" = "1" ] && echo "husky (debug) - $1"
  }

  readonly hook_name="$(basename -- "$0")"
  debug "starting $hook_name..."

  if [ "${HUSKY}" = "0" ] ; then
    debug "HUSKY env variable is set to 0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  if [ -f ~/.huskyrc.sh ]; then
    debug "sourcing ~/.huskyrc.sh"
    . ~/.huskyrc.sh
  fi

  readonly huskyrc="${XDG_CONFIG_HOME:-$HOME/.config}/husky/init.sh"
  if [ -f "$huskyrc" ]; then
    debug "sourcing $huskyrc"
    . "$huskyrc"
  fi
fi
