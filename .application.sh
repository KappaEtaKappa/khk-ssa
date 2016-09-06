#!/bin/bash
sqlite3 ../khk-ssa/khk-access/db.sqlite "INSERT INTO apps (name, privilegeRequired, subdomain, icon) values (\"Drive\", 1, \"drive\", \"fa-file-text\");"
