@echo off
cd C:\Projects\Diploma\Calendar
call .\venv\Scripts\activate

cd C:\Projects\Diploma\Calendar\EnterpriseCalendar
start cmd /k "python manage.py runserver"

timeout /t 5

start "" "http://127.0.0.1:8000/auth"
