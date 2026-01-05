#!/bin/bash
cd /home/kavia/workspace/code-generation/intern-submission-tracker-40960-40969/frontend_react_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

