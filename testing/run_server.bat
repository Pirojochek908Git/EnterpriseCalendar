@echo off
cd C:\Projects\Diploma\Calendar
call C:\Projects\Diploma\Calendar\venv\Scripts\activate

cd C:\Projects\Diploma\Calendar\EnterpriseCalendar
start cmd /k "C:\Projects\Calendar\venv\Scripts\python.exe manage.py runserver"

timeout /t 5

start "" "http://127.0.0.1:8000/auth"