# Readme
This NodeJS app calls the OpenSky API (https://opensky-network.org/api/states/all) and converts the returned JSON into a CSV adding the returned timestamp as a new timestamp column in the CSV.

This NodeJS app can be scheduled to run using a cronjob (crontab). The API data is refreshed every 30 seconds.
