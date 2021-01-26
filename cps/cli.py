# -*- coding: utf-8 -*-

#   This file is part of the Calibre-Web (https://github.com/janeczku/calibre-web)
#     Copyright (C) 2018 OzzieIsaacs
#
#   This program is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program. If not, see <http://www.gnu.org/licenses/>.

from __future__ import division, print_function, unicode_literals
import sys
import os
import argparse
import socket

from .constants import CONFIG_DIR as _CONFIG_DIR
from .constants import STABLE_VERSION as _STABLE_VERSION
from .constants import NIGHTLY_VERSION as _NIGHTLY_VERSION


def version_info():
    if _NIGHTLY_VERSION[1].startswith('$Format'):
        return "Calibre-Web version: %s - unkown git-clone" % _STABLE_VERSION['version']
    return "Calibre-Web version: %s -%s" % (_STABLE_VERSION['version'], _NIGHTLY_VERSION[1])


parser = argparse.ArgumentParser(description='Calibre Web is a web app'
                                 ' providing a interface for browsing, reading and downloading eBooks\n', prog='cps.py')
parser.add_argument('-p', metavar='path', help='path and name to settings db, e.g. /opt/cw.db')
parser.add_argument('-g', metavar='path', help='path and name to gdrive db, e.g. /opt/gd.db')
parser.add_argument('-c', metavar='path',
                    help='path and name to SSL certfile, e.g. /opt/test.cert, works only in combination with keyfile')
parser.add_argument('-k', metavar='path',
                    help='path and name to SSL keyfile, e.g. /opt/test.key, works only in combination with certfile')
parser.add_argument('-v', '--version', action='version', help='Shows version number and exits Calibre-web',
                    version=version_info())
parser.add_argument('-i', metavar='ip-address', help='Server IP-Address to listen')
parser.add_argument('-s', metavar='user:pass', help='Sets specific username to new password')
parser.add_argument('-f', action='store_true', help='Enables filepicker in unconfigured mode')
args = parser.parse_args()

if sys.version_info < (3, 0):
    if args.p:
        args.p = args.p.decode('utf-8')
    if args.g:
        args.g = args.g.decode('utf-8')
    if args.k:
        args.k = args.k.decode('utf-8')
    if args.c:
        args.c = args.c.decode('utf-8')
    if args.s:
        args.s = args.s.decode('utf-8')


settingspath = args.p or os.path.join(_CONFIG_DIR, "app.db")
gdpath       = args.g or os.path.join(_CONFIG_DIR, "gdrive.db")

# handle and check parameter for ssl encryption
certfilepath = None
keyfilepath = None
if args.c:
    if os.path.isfile(args.c):
        certfilepath = args.c
    else:
        print("Certfilepath is invalid. Exiting...")
        sys.exit(1)

if args.c == "":
    certfilepath = ""

if args.k:
    if os.path.isfile(args.k):
        keyfilepath = args.k
    else:
        print("Keyfilepath is invalid. Exiting...")
        sys.exit(1)

if (args.k and not args.c) or (not args.k and args.c):
    print("Certfile and Keyfile have to be used together. Exiting...")
    sys.exit(1)

if args.k == "":
    keyfilepath = ""

# handle and check ipadress argument
ipadress = args.i or None
if ipadress:
    try:
        # try to parse the given ip address with socket
        if hasattr(socket, 'inet_pton'):
            if ':' in ipadress:
                socket.inet_pton(socket.AF_INET6, ipadress)
            else:
                socket.inet_pton(socket.AF_INET, ipadress)
        else:
            # on windows python < 3.4, inet_pton is not available
            # inet_atom only handles IPv4 addresses
            socket.inet_aton(ipadress)
    except socket.error as err:
        print(ipadress, ':', err)
        sys.exit(1)

# handle and check user password argument
user_credentials = args.s or None
if user_credentials and ":" not in user_credentials:
    print("No valid username:password format")
    sys.exit(3)

# Handles enableing of filepicker
filepicker = args.f or None
