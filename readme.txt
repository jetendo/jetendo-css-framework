Overview
Structure
Grid
Grid Offset
Sidebars
Padding & Margins
Tables
Typography
Visibility
Breakpoint Helpers
Image
Menu
Equal Heights
Element Queries
Other
Animation

Overview
	
	We write things ourselves to leverage the technologies we use, and to automate the specific needs of our business.   We can see value in other html / css / js layout frameworks, but we disagree with some of the things they have done and we set out to add additional automation steps which those framework can't do for us.
	
	We have developed our own HTML/CSS/JS framework to reduce the amount of work to do HTML conversion and increase code reuse.  We pulled ideas from several popular framework projects including cascade framework, less space, bootstrap, foundation and several javascript projects.  Many of those systems are based on less/sass compilation systems.  Instead of adopting those technologies, we built a CSS code generation system in our application that lets us reconfigure the framework space/text sizes visually with simple forms so that each web site can have its own unique default configuration of the framework.  

	A lot of the work when building HTML is related to taking measurements and typing these measurements.  If the math is not accurate, you end up having to fix bugs at various sizes.   We are trying to eliminate most of these measuring / typing steps, by encouraging the programmers to use the predefined classes in the framework now instead of trying to be pixel perfect on every detail.    It is important to us that the HTML doesn't stray too far from the original design, but some amount of inaccuracy will be acceptable at all screen sizes as long as the general alignments and details are preserved.  It is especially important to us that the header of the web site is accurate, but other parts may be less accurate now.
	
	The framework has multiple grid systems using percent based calculations for width/padding/margin.  We think this makes it easier to do uneven column widths without writing having to write any new CSS or mobile code.    This feature was inspired by cascade framework.

	The generated CSS varies in size depending on how it is configured, and it vary between 90kb and 200kb.  We feel this is an acceptable size since the minified bootstrap css file is 200kb.   We also avoided the use of commas to compress our CSS on purpose, to minimize the amount of classes shown when you inspect a single element in the browser with the developer tools.  We don't like how cluttered bootstrap is in comparison.

	Overview of Features:

		9 grid systems with offset, column gutter, and padding.
		Everything is built using math & percentages, except for the optional fixed size classes.  Percentages inherit into mobile code, so there is less code, and less to override to make mobile or even 960 work correctly.
		Most of the features work correctly when combined. Grids can be nested inside other grids without problems.  However, the z-container should not be combined with padding/margin/grid classes
		The grid system has a concept of minimum column width in mobile devices, and a 2+ column structure is supported in tablet, which converts to single column on phones.
		All grid systems have margins and padding which makes it so that text is never touching the edge of containers.
		Separation of heading and body text font sizes.  Most font sizes will be defined with scalable classes like z-h-36 and z-t-18
		Ability to set margin/padding sizes more quickly with predefined class like z-pv-40
		All padding/margin/font/width sizes scale at each breakpoint.
		A set of classes were built for forcing fixed sizes that don't scale for dealing with image based designs that are extremely inflexible.
		Centering children box elements was made easy
		Optional responsive lazy loading background and foreground images (currently requires CFML / JS)
		Built a feature that lets image touch the edge of the screen and scale responsively regardless of where the parent container starts and ends on the page.
		Classes for hiding/showing elements at each breakpoint like z-hide-at-767 or z-show-at-1362
		Simpler way to do translateX/Y animations was built-in.
		Built-in javascript layout features were reorganized into a single file to make it easier to share.
		Box equal heights code has been enhanced to allow operating on rows separately, and also defining a child class so that you can operate on nested elements instead of only children.
		The framework is optional and doesn't interfere with the existing sites, however I fixed some problems in javascript / breakpoints while working on it.
		Making left/right sidebars with content element first in the HTML has been made much easier with classes which remove the need to measure/type widths, and it also keeps the background colors/images working all the way down the page.
		Nearly all layouts can be made without having to exactly measure and type width/height.
		Changes to the framework will have the chance of breaking the layout of projects using it.  We will have to go back and test them more to avoid this.  We might not need to change it much anymore after finishing a few projects with it.

	Because we are switching to percent based layouts, and conventions, we are not going to match the photoshop design pixel perfect anymore on any project.  Sometimes we are forced to used fixed dimensions because the design doesn't allow any changes to the space like in the desktop size header or menu systems.

	There are a variety of mobile friendly image loading features built into the framework, which can be optionally used.

	I'm also using html5 semantic tags now, header,aside,nav,section,footer, which can describe the structure of a page.

	I rewrote the menu code to allow all the menu buttons to appear between 768 to 992 (tablet portrait).  It figures out how to auto-center the buttons with equal spacing and can switch to 2+ rows if there is no room without any glitches.   The code to integrate this was moved to the core, so you only need to have html & class structure to get mobile menus working.   On more basic sites, this menu code would be used for the desktop menu too.  This is something new we want in future projects.
	
	I rewrote the code for 3 line mobile phone menu to use CSS transition / transform, to animate from the side of the screen.  I also made it able to work like usual as an option too.  It uses transform which is hardware accelerated and smoother.  I made it possible for the menu to come in from 4 directions.  This is something new we want in future projects.

	I did compatibility testing on all sizes, all devices/browsers.  Note: we don't support or test or try to make things work with ie8 at all anymore since 2-4 months ago.  Users see an incompatibility warning on that browser with link to upgrade that is hosted by Google. The warning can be hidden.  This is similar to how other companies handle it, like Google.

	I'd also like to build more code generation tools later that can create the initial structure of a page using the framework class names.  You'd build a page layout visually and then export it as html / css / js that is already working mobile responsive and then you just skin the rest.   This would make it easier for people to use things correctly and type less.

	It is easy to use a framework wrong.  The danger of doing that is that you end up having to write more mobile code to fix things.   The mobile code is mostly automatic if we can learn how to use it consistently.

	Don't forget that the css framework is able to be re-published per site and per breakpoint to have very different values for all the spacing and sizes.   By using these classes, you'll not only inherit the hardcoded css, but also the dynamic values too which makes reskinning existing code on a new site faster.

Structure
	
	You should use <header> and <footer> elements to separate those from the rest of the HTML.
	<header>
		Logo and menu
	</header>
	<section>
		body content
	</section>
	<footer>
		Logo, menu and copyright
	</footer>

	Each horizontal section of the body of the page should be separated with a section element.  
	All of the semantic HTML elements including header,footer,section,aside,article,nav are set to be width:100%; float:left; by default.  They can be nested without any problems.
	You should give each section a unique section class name that you use to do the rest of the styling of that section in the CSS.
	Example:
	<section class="section-1">
	</section>
	<section class="section-2">
	</section>
	<style type="text/css">
	.section-1{ background-color:#000; min-height:10px; }
	.section-1{ background-color:#FFF; min-height:10px; }
	</style>
	
	The body content can be centered at a fixed width by using the z-container class.  
	<section class="section-1">
		<div class="z-container">
			<div class="z-column">
				Test
			</div>
		</div>
	</section>
	<style type="text/css">
	.section-1{ background-color:#000; color:#FFF; } 
	.section-1 .z-column{ background-color:#666; color:#FFF; } 
	</style>
	
	If you nest a z-container, instead another z-container, the nested container will be fluid (width:100%) instead of having a fixed width.   It is recommend to separate each horizontal row with a <section> element or <div class="z-container"> if you need to clear:both sides and show something on the next line.
	
	Important: You should never set padding, margin or background image/color on the element that is using the z-container class.  You will get much better results making these changes on the section or the children elements instead.
	
Breakpoints
	This fixed width of the z-container class will resize based on the width of the screen to match the breakpoints we have defined for this framework.   
	We are still writing the CSS in the order of largest screen to smallest screen.
	We have defined new breakpoints which must be used instead of other previously discussed breakpoints.
	For content that is supposed to be at least 1200 pixels wide, we should not use a breakpoint, and put this CSS first.
	For content that is supposed to fit within 980 to 1200, we should use the max-width:1362 breakpoint. 
	For content that is supposed to fit within 768 to 979, we should use the max-width:992 breakpoint.
	For content that is supposed to fit within 480 to 767, we should use the max-width:767 breakpoint
	For content that is supposed to fit within 0 to 479, we should use the max-width:479 breakpoint
	These breakpoints should not be changed as all of the CSS and javascript has been designed to work only with these breakpoints.  You can add other breakpoints if necessary to change how things present themselves.
	
Grid
	Unlike other CSS frameworks like foundation and bootstrap, we are providing multiple grid systems.  This let you subdivide the space with different propotions and in a simpler way then a single grid system might allow.
	Each grid system has it's own complete set of classes to define columns that are 1 to X wide.  Where X is the maximum number of columns in that grid system.
	
	Example of the 3 column grid system:
		<section class="section-1">
			<div class="z-container">
				<div class="z-1of3">
					Column 1
				</div>
				<div class="z-2of3">
					Column 2
				</div>
			</div>
		</section>
	
	Each grid column element has its own default margin and padding which is based on the global settings page in Jetendo CMS.  There is margin on the left and right, which should be preserved in most layouts since it helps to make the mobile experience nicer when the content doesn't touch the very edge of the screen.  Don't automatically set the padding or margins to zero unless you are sure you won't need them on mobile.
	
	If you don't need multiple columns, you should still define a z-column in order to inherit the margin and padding so that the layout matches the multiple column grids.   If you forget to do this, then you will end up writing more CSS code for each breakpoint then necessary.
	Example:
		<section class="section-1">
			<div class="z-container">
				<div class="z-column">
					Column
				</div>
			</div>
		</section>
		
	You can nest grid systems inside each other.  This works because all of the width/margin/padding sizes are defined as percentages instead of pixel sizes.  Example:
		<section class="section-1">
			<div class="z-container">
				<div class="z-1of3">
					Column 1
				</div>
				<div class="z-2of3">
					<div class="z-1of2">
						Sub column 1
					</div>
					<div class="z-1of2">
						Sub column 2
					</div>
				</div>
			</div>
		</section>
		
Grid Offset
	Column grid offset classes are available for all of the grid systems.   These classes override the margin-left to allow you to create gaps on the left of a grid element quickly by applying an extra class to that grid element.   The syntax is z-offset1of3 to set an offset.  These offset classes should be used on elements that are also using a grid system class for the best results.

	Example: With a 7 column grid, you could have first 2 columns empty on the left, a 3 column block, and 1 column empty on the right using an offset class like this:
	<div class="z-container">
		<div class="z-offset-2of7 z-3of7">
		</div>
	</div>
	
	Offsets are disabled on mobile devices.  Below the 992 breakpoint, the offset class is reset back to the normal left margin of the grid column class.


Sidebars 
	The framework makes it easy to define sidebars without having to type exact pixel dimensions.  These classes are designed to automatically switch to responsive fluid 100% columns at 992 and below.   
	
	z-left-sidebar, z-right-sidebar and z-fill-width can be used to make sidebars quickly.
	
	Right sidebar with automatic fill width column
	<section> 
		<div class="z-container"> 
			<div class="z-column z-p-0">
				<aside class="z-column z-fill-width">
					Body Text
				</aside>
				<section class="z-1of4 z-right-sidebar">
					Right Sidebar
				</section>
			</div> 
		</div>
	</section>
	
	You can force the content element to be first in the html for left sidebars by using z-reverse-order.  Example:

	<section>
		<div class="z-container"> 
			<div class="z-column z-p-0 z-reverse-order">
				<section class="z-column z-fill-width">
					Body Text
				</section>
				<aside class="z-1of4 z-left-sidebar">
					Left Sidebar
				</aside> 
			</div>
		</div>
	</section>
	
	If you want to use z-reverse-order on other code, be aware that you will need to put the z-normal-order class on the children elements or direction:ltr; to get the rendering direction back to normal.   This is done for you in the z-fill-width, z-left-sidebar, z-right-sidebar classes.
	
	You can also have both a left and right sidebar at once. Example:
	
	<section>
		<div class="z-container"> 
			<div class="z-column z-p-0 z-reverse-order">
				<section class="z-1of4 z-right-sidebar">
					Right Sidebar
				</section>
				<section class="z-column z-fill-width">
					Body Text
				</section>
				<aside class="z-1of4 z-left-sidebar">
					Left Sidebar
				</aside> 
			</div>
		</div>
	</section>
	
	z-column and z-p-0 classes are used in these sidebar examples to enable margins match the rest of the grid system, but remove all the padding since the padding is also included in the sidebar and body text elements.
	
Padding & Margins
 
	There is a set of predefined classes which let you set padding and margin more quickly.  In the examples below, you can change 10 to any number between 0 and 150 in intervals of 10. I.e. z-p-0, z-p-10, z-p-150.
	
	Note: this table will become a real HTML table later in the documentation, you may find it easier to read the text version below it instead.
	<table>
	<tr><th><th>CSS</th><th>Class</th></tr>
	<tr><td>padding</td><td>z-p-10</td></tr>
	<tr><td>padding-top</td><td>z-pt-10</td></tr>
	<tr><td>padding-right</td><td>z-pr-10</td></tr>
	<tr><td>padding-bottom</td><td>z-pb-10</td></tr>
	<tr><td>padding-left</td><td>z-pl-10</td></tr>
	<tr><td>padding-top and padding-bottom</td><td>z-pv-10</td></tr>
	<tr><td>padding-left and padding-right</td><td>z-ph-10</td></tr>
	<tr><td>margin</td><td>z-m-10</td></tr>
	<tr><td>margin-top</td><td>z-mt-10</td></tr>
	<tr><td>margin-right</td><td>z-mr-10</td></tr>
	<tr><td>margin-bottom</td><td>z-mb-10</td></tr>
	<tr><td>margin-left</td><td>z-ml-10</td></tr>
	<tr><td>margin-top and margin-bottom</td><td>z-mv-10</td></tr>
	<tr><td>margin-left and margin-right</td><td>z-mh-10</td></tr>
	<tr><td>margin-top and margin-bottom set to 10 with left/right set to auto</td><td>z-mv-10-auto</td></tr>
	<tr><td>margin-left and margin-right set to 10 with top/bottom set to auto</td><td>z-mh-10-auto</td></tr>
	</table>
	
	text version:
	CSS      Class
	padding     z-p-10     
	padding-top     z-pt-10     
	padding-right     z-pr-10     
	padding-bottom     z-pb-10     
	padding-left     z-pl-10     
	padding-top and padding-bottom     z-pv-10     
	padding-left and padding-right     z-ph-10     
	margin     z-m-10     
	margin-top     z-mt-10     
	margin-right     z-mr-10     
	margin-bottom     z-mb-10     
	margin-left     z-ml-10     
	margin-top and margin-bottom     z-mv-10     
	margin-left and margin-right     z-mh-10     
	margin-top and margin-bottom set to 10 with left/right set to auto     z-mv-10-auto     
	margin-left and margin-right set to 10 with top/bottom set to auto     z-mh-10-auto    
	
Table
	It's harder to deal with vertical alignments unless you use display:table-cell and height in CSS.  We've included a set of classes to let you align the children text/images in all 10 positions.
	
	To force table mode on a container, use the z-table class. On the child elements, you can use one of the following classes to make it have display:table-cell and the alignments set.
	
	z-table-center
	z-table-top-center
	z-table-bottom-center
	z-table-top-left
	z-table-top-right
	z-table-center-left
	z-table-center-right
	z-table-bottom-left
	z-table-bottom-right
	z-table-bottom-left
	
	Example:
	<section>
		<div class="z-container"> 
			<div class="z-table z-mv-20" style=" height:200px; background-color:#CCC;">
				<div class="z-heading-48 z-table-bottom-right">
					Section Heading
				</div>
			</div> 
		</div> 
	</section>
	 
Typography
	It is important for you to identify which text is a heading, and which text is smaller body text and use different CSS classes for each.  Our goal is to define all font sizes for heading separately so that we can reuse the code faster and be able to have entirely different fonts for headings without needing to make many different adjustments.   The heading class have padding under them that scales as the font size increases.
	
	Example of scalable heading:
	<div class="z-h-36">Heading</div>
	
	Example of scalable text:
	<div class="z-t-16">Text</div>
	
	By using these classes for all font sizes, the font size will automatically reduce on each breakpoint according to the settings.  If this scaling is undesirable, we have also included a set of classes that allows you to force the font size to stay the same at every breakpoint.
	
	Example of fixed size heading:
	<div class="z-fh-36">Heading</div>
	
	Example of fixed size text:
	<div class="z-ft-16">Text</div>
	
	The fixed and scalable font size classes exist for all sizes between 12 and 70, i.e. z-h-12 to z-h-70 and z-t-12 to z-t-70.  If you need a larger or smaller size, please write the CSS code yourself.
	
	Our framework makes the padding and margins above the p, ul, ol, and heading (h1, h2, etc) elements 0.  We then reset them to have padding on the bottom only.
	
	The framework is setting the body element to line-height:1.3.  This should not be overriden unless the design has clearly set a very large line-height in some areas of the page.
	
	There are default sizes set for <h1> through <h6> elements as well, which inherit their scaling settings from the global settings in Jetendo CMS.
	
	There are classes for text alignment including: z-text-left, z-text-center and z-text-right
	
	Change font:
		z-italic
		z-bold
		z-bold-italic
		z-normal - changes font to normal
		z-uppercase
		z-no-bullets
	
	Change text and link color quickly to white or black.  Transparent versions will let background color passthrough slightly.
	z-text-white, z-text-black, z-text-white-transparent, z-text-black-transparent

	Between z-h-12 and z-h-70 should be used for all heading font sizes, or h1 through h6 can be used instead.  h1 should only be used for the main title, and not repeated on other areas, unless separated by these html5 tags: <article>, <section>, <nav> or <aside>
	
	Between z-t-12 and z-t-70 should be used for all non-heading font sizes or leave it to inherit.

	
Image
	Add the z-fluid class to img tag to make it responsive.
		z-fluid

	Fluid images that touch the edge of the screen
		Sometimes the design calls for an img tag that appear to touch the edge of the screen in a text left / image right section layout.   If you using background-image for this, it will either end up with the text overlapping the image too much, or the background being cropped when the screen gets smaller.  This causes a lot more work to get that responsive behavior to look good.  It often seems easier to just disable the image or have a second image instead.
	
		To make this take less work, we've come up with a javascript solution that can be used by just adding a single class to the img tag.
		
		There are 2 classes, one for making the image touch the left of the screen:
			zForceNegativeMarginLeft
		
		And one for the right of the screen:
			zForceNegativeMarginRight
			
		The interesting thing about these is that it doesn't matter where the parent container starts and ends on the page.  The javascript will calculate the width and negative margin automatically so that the image touches the edge.
		
		The image is also not allowed to become large then it's original size, to prevent it from looking blurry.
			
		Example: 
		<section>
			<div class="z-container">
				<div class="z-1of4"> 
					<img src="/images/largeImage.png" class="zForceNegativeMarginLeft" alt="image">
				</div>
				<div class="z-3of4">
					<h1>Heading</h1>
					<p>Text</p> 
				</div> 
			</div>
		</div>
	
	There are lazy loading background and foreground image features into the framework, but these features currently require access to our CFML application, and can't be written directly in javascript.  We may provide a way to do this in the standalone CSS framework at a later date.  
	 
Menu
	We have integrated one kind of menu system so that commonly needed behavior can be setup quick for mobile menus.   If a design has a very custom menu, you may want to use this code only for the mobile menu.  If the menu is simple even on the desktop version, then you can use this for the menu at all sizes.   We don't want to use ul/li elements for the menu at this time.  This eliminates the need to override the behavior of list elements.
	
	Example:
	<div class="mobile-menu">
		<a href="#" class="z-mobileMenuButton">&#9776; Menu</a>
		<div id="myMenu1" class="z-mobileMenuDiv z-mobileMenuTranslateXLeftOffscreen" data-column-gap="30" data-open-class="z-mobileMenuTranslateX">
			<div class="z-h-30 z-show-at-767">Menu</div>
			<!--- don't use ul/li for mobile menu! --->
			<nav class="z-center-children">
				<div><a href="/about/index">About</a></div>
				<div><a href="/engineering-manufacturing/index">Engineering &amp; Manufacturing</a></div>
				<div><a href="/training/index">Training</a></div>
				<div><a href="/procurement-services/index">Procurement Services</a></div>
				<div><a href="/outreach/index">Outreach</a></div>
				<div><a href="/capabilities-brief/index">Capabilities Brief</a></div>
				<div><a href="/contact-us/index">Contact</a></div>
				<div><a href="/suppliers/index">Suppliers</a></div>
				<div><a href="/customers/index">Customers</a></div>
			</nav>
		</div>
	</div>
	
	At the 768 to 992 breakpoint:
		data-column-gap="30" forces the gap between buttons to be at least 30 pixels.  You can adjust this to another value.
		If the buttons won't fit on one row, they will use additional rows.
	At the <767 breakpoint, the menu will animate in from the left of the screen when you click on the Menu button.
	You can change the direction of the animation with other classes.  Here are all the different configurations currently supported: 
		<div id="myMenu1" class="z-mobileMenuDiv z-mobileMenuTranslateXLeftOffscreen" data-column-gap="30" data-open-class="z-mobileMenuTranslateX">
		<div id="myMenu1" class="z-mobileMenuDiv z-mobileMenuTranslateXRightOffscreen" data-column-gap="30" data-open-class="z-mobileMenuTranslateX">
		<div id="myMenu1" class="z-mobileMenuDiv z-mobileMenuTranslateYLeftOffscreen" data-column-gap="30" data-open-class="z-mobileMenuTranslateY">
		<div id="myMenu1" class="z-mobileMenuDiv z-mobileMenuTranslateYRightOffscreen" data-column-gap="30" data-open-class="z-mobileMenuTranslateY">
		
	You can also have the menu drop down from below the menu button instead by using this configuration:
		<div id="myMenu1" class="z-mobileMenuDiv" data-column-gap="30">
	
	
Visibility
	Hiding and shows elements using display:block or display:none in CSS is commonly done when writing responsive web sites.  There are a set of classes to enable this at the various breakpoints.
	z-show-at-1362
	z-show-at-992
	z-show-at-767
	z-show-at-479
	z-hide-at-1362
	z-hide-at-992
	z-hide-at-767
	z-hide-at-479
	
Breakpoint Helpers
	Sometimes you need to disable any width / height / margin and force an element to max-width:100% so that it fills the container or screen.  This is very commonly needed on img tags.  You can use the z-fluid class to do this.
	Example:
	<img src="/images/largeImage.png" class="z-fluid" />
	
	If you don't want the fluid behavior to happen until a certain breakpoint, we have added these additional classes to make that possible.  The fluid behavior will take effect for all screen widths at and below the breakpoint number.
	z-fluid-at-1362
	z-fluid-at-992
	z-fluid-at-767
	z-fluid-at-479
	
Centering Boxes
	
	Quickly center children box elements using z-center-children.  The children elements must be either "div" or "a" html tags.  The children will have their font size reset to the default, which is equivalent to the class z-t-16 scalable font size class. 
	Example:
		<section class="section-1">
			<div class="z-container z-center-children">
				<div class="z-1of3">
					Column 1
				</div>
				<div class="z-1of3">
					Column 2
				</div>
				<div class="z-1of3">
					Column 3
				</div>
				<div class="z-1of3">
					Column 3
				</div>
			</div>
		</section>

	You might not want the centering behavior to occur at the full desktop size.  You can enable centering of the children boxes at smaller breakpoint instead using these classes:		
		z-center-children-at-992
		z-center-children-at-767
Other

	Set border-radius to 5, 10 or 15 with these classes:
		z-radius-5
		z-radius-10
		z-radius-15
		
	Quickly set white or black border of 1 or 2 pixels with these classes:
		z-border-white-1, z-border-black-1, z-border-white-2, z-border-black-2
		
	Quickly set white or black background with these classes.  Text/link colors are also set to the opposite.
		z-bg-white, z-bg-black, z-bg-white-transparent, z-bg-black-transparent

	Buttons should use the z-button class unless they are very custom. Example:
		<a href="#" class="z-button">More Info</a>
	
	You can center a button like this:
		<div class="z-center-children">
			<a href="#" class="z-button">More Info</a>
		</div>
		
	You can float an element left or right using these classes:
		z-float-left, z-float-right
		
	Disable float
		z-float-none, z-float-none-important
	
	You can float:left and width:100%; with this class:
		z-float
	
	z-index
		Quickly set z-index to 1, 2 or 3 and position:relative using these classes: 
		
		z-index-1, z-index-2, or z-index-3
		
		This is useful when dealing with negative margin overlays, slideshows or other things that use custom positioning.
	
	z-overlay-bottom
		This class forces the element to the bottom of the container.  Requires z-index-1 or position:relative to be set on the container because it uses absolute positioning.   This helps you eliminate the need for typing a specific height or negative margin of an overlay.
		<a href="#" class="z-index-1 z-1of3">
			<span class=" z-overlay-bottom z-p-10">Title</span>  	
			<img src="/images/photo3.jpg" alt="thumb" class="z-fluid z-float-left" />
		</a>
	
	Added CSS arrows that rely on changing the border color, instead of using images.  Examples:
		<span class="z-arrow-right-10" style="border-left-color:#F00;"></span>
		<span class="z-arrow-left-10" style="border-right-color:#F00;"></span>
		<span class="z-arrow-top-10" style="border-bottom-color:#F00;"></span>
		<span class="z-arrow-bottom-10" style="border-top-color:#F00;"></span>

	White and black gradients gradients.   Automatically sets opposite text color.   The middle classes fade closer to the edge instead of a continuous fade.
	
		z-bg-black-gradient-fade-down-80
		z-bg-white-gradient-fade-down-80
		z-bg-black-gradient-fade-up-80
		z-bg-white-gradient-fade-up-80
		z-bg-black-gradient-fade-down-100
		z-bg-white-gradient-fade-down-100
		z-bg-black-gradient-fade-up-100
		z-bg-white-gradient-fade-up-100
		z-bg-white-gradient-middle-fade-down-80
		z-bg-white-gradient-middle-fade-up-80
		z-bg-white-gradient-middle-fade-down-100
		z-bg-white-gradient-middle-fade-up-100
		z-bg-black-gradient-middle-fade-down-80
		z-bg-black-gradient-middle-fade-up-80
		z-bg-black-gradient-middle-fade-down-100
		z-bg-black-gradient-middle-fade-up-100

	
Equal Heights
	Force equal heights on children elements using z-equal-heights.  Example:
	
	<div class="z-container z-equal-heights">
		<div class="z-1of2">
			Stuff
		</div>
		<div class="z-1of2">
			More<br />Stuff
		</div>
	</div>

	You can force equal heights to measure the heights for each row separately by adding the data-column-count attribute and setting it to the number of columns per row.  Example:
	
	<div class="z-container z-equal-heights" data-column-count="2">
		<div class="z-1of2">
			Stuff
		</div>
		<div class="z-1of2">
			More<br />Stuff
		</div>
		<div class="z-1of2">
			Stuff
		</div>
		<div class="z-1of2">
			More<br />And<br />More<br />Stuff
		</div>
	</div>
	
	By specifying a jquery compatible selector in the data-children-class attribute, you can force the equal heights to be calculated for the selected children instead of the direct children of the parent element.  It is required that the selector references elements that are inside the parent container.  You can use a more complex selector such as .body .child as well.   Behind the scenes, it is using jquery like this $(".body", this); in the example below, where "this" is the div that has z-equal-heights on it.
	
	<div class="z-container z-equal-heights" data-column-count="3" data-children-class=".body">
		<div class="z-1of3">
			<div class="z-h-30">Heading</div>
			<div class="body">Body<br />Content</div>
		</div>
		<div class="z-1of3">
			<div class="z-h-30">Heading</div>
			<div class="body">Body</div>
		</div>
		<div class="z-1of3">
			<div class="z-h-30">Heading</div>
			<div class="body">Three<br />Lines of<br />Content</div>
		</div>
	</div>

	Notice the above example also has data-column-count="3" which is optional.  These features can be combined or used separately.  If you combine data-children-class with data-column-count, it will do the height calculations separately for each row, but it will operate on the custom selected children instead.   
	
Element Queries
	Instead of using media queries to change the layout based on the screen size, we have created a CSS/JS solution for changing the layout of specific elements based on the width of their parent container.   This lets you build complex layouts that are reusable inside different size containers.  You start by adding the class "z-breakpoint" and then the "data-breakpoints" attribute is set to a comma separated list of the custom breakpoints you want to define. 
	A class will be assigned the to the element with z-breakpoint on it when the width of the parent container is less then or equal to the breakpoints.   The class will be named "z-breakpoint-" plus the breakpoint number.  So if the parent width was 690 in the example below, a class called z-breakpoint-700 would be added to the element.

	You can use the class (z-breakpoint-700, etc) to change the layout.  Example CSS is included below.  Notice that there is no space between .big-column and .z-breakpoint-700 in the selector.  This is important, because we need both of them for the class to be applied so that other sections of the page are not affected.
	
	Note that if you had defined a different breakpoint such as 450, the class would be called z-breakpoint-450 instead.  There are no predefined sizes built-in.
	
	Example:
	<style type="text/css"> 
	/* z-breakpoint should be written mobile first */
	.section-1 .big-column{ width:100%; height:100px; background-color:#CCC; padding:20px; float:left; margin-right:20px; margin-bottom:20px;} 
	.section-1 .big-column.z-breakpoint-300:before{content:"Breakpoint 300 applied";}
	.section-1 .big-column.z-breakpoint-300{width:100%; background-color:#CCF;}
	.section-1 .big-column.z-breakpoint-500:before{content:"Breakpoint 500 applied";}
	.section-1 .big-column.z-breakpoint-500{ background-color:#CFC;}
	.section-1 .big-column.z-breakpoint-700:before{content:"Breakpoint 700 applied";}
	.section-1 .big-column.z-breakpoint-700{  background-color:#FCC;}
	</style>
	<section class="section-1">
		<div class="z-container"> 
				<div class="z-2of3">
					<div class="big-column z-breakpoint" data-breakpoints="700,500,300">
					Resize window to see the breakpoint changes
					</div> 
			</div>
		</div>
	</section>
	
Animation

	Animate on visible
		To make an animation not happen until the element is visible, we created the zAnimateOnVisible class.  It waits until the user has scrolled and made the element visible.  If the element was visible on page load already, the animation will trigger immediately when the document onload event fires.  The initial state of your element should be defined with a class on the element.   Then you define the data-visible-class="yourClass" attribute.  Where "yourClass" is a class that has the end keyframe of your animation.     z-transition-all is a class that sets transition to allow animation to occur on all CSS parameters.  If you need to animate only one parameter, you should define your own transition CSS instead.
		
		Example:
			<div class="initialClass zAnimateOnVisible z-transition-all" data-visible-class="animateClass">
				Test
			</div>
			<style type="text/css">
			.initialClass{ background-color:#000;}
			.animateClass{ background-color:#000;}
			</style>
	