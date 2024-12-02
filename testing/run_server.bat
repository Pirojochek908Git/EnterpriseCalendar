@echo off
cd C:\Projects\Calendar
call C:\Projects\Calendar\venv\Scripts\activate

cd C:\Projects\Calendar\EnterpriseCalendar
start cmd /k "C:\Projects\Calendar\venv\Scripts\python.exe manage.py runserver"

timeout /t 5

start "" "http://127.0.0.1:8000/auth"