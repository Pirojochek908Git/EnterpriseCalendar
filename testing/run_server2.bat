@echo off
cd C:\Projects\Diploma\Calendar\EnterpriseCalendar
call .\venv\Scripts\activate
start cmd /k "python manage.py runserver"

timeout /t 5

start "" "http://127.0.0.1:8000/auth"
