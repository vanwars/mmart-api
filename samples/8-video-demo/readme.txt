My Plan:

The purpose of my app is to make a map of murals in Berkeley that people can virtually appreciate, and visit if they want. 

----------
API Design
----------
My map will have 2 endpoints:

1) /vanwars/public-art/
My public art endpoint will have the following attributes:
	* _id (auto-generated)
	* name
	* contributors
	* about
	* type (murals, sculptures, etc.)
	* tags
	* year
	* loc_desc (description of the location)
	* lat (latitude)
	* lng (longitude)

2) /vanwars/public-art-photos/
I decided to make a separate public-art-photos endpoint, because I have many photos for each public art piece.

	* _id (auto-generated)
	* site_id (the corresponding mural’s _id) **important
	* image
	* caption
	* tags

----------
App Design
----------

Screen 1: Front page
On the front page, there will be a list of public art pieces (from the “public-art” endpoint).

Screen 2: Public art details
Detail about the art piece, and a list of corresponding photos (from the “public-art-photos”) endpoint.

Screen 3: Add new public art location

Screen 4: Edit public art location

Screen 5: Add new photo of public art piece

Screen 6: Edit the captions and tags of each photo

Screen 7: If there’s time, a map of public art pieces


-------------
Security Tips
-------------
To develop locally on your computer, instead of a server, you have 2 options:

1. Temporarily disable your Chrome Security while you're developing your app (also covered in the Lynda.com tutorial). To do this, 
	a) Make sure you completely close out of Chrome
	b) Open Terminal
	c) Run the following command by pasting it into Terminal:
		open -a Google\ Chrome --args --disable-web-security --user-data-dir -–allow-file-access-from-files
	d) When you're done, close out of Chrome and the next time you open it, your security will be reinstated. This is just a temporary setting.

2. Run a local web server. To do this:
	a) Open Terminal
	b) Navigate to the folder where your code is located
		cd 
	c) Run the following command by pasting it into Terminal:
		python -m SimpleHTTPServer 8000
	d) Navigate to http://localhost:8000 to view your website
	e) When you're done, close out of the Terminal


	

