@echo off

set BUILD_TARGET=gridalice.js
cd /D %~dp0

del %BUILD_TARGET%

copy /b ..\js\main.js+..\js\gridguy.js+..\js\target.js+..\js\util.js %BUILD_TARGET%

@pause