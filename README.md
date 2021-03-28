# [SyncFit](https://devpost.com/software/syncfit)
*Save time and quickly download FitBit GPS and heartrate data to upload your workouts to your favorite fitness tracking app.*

## ❓ Where did "SyncFit" come from?

#### The Problem
Recently, I discovered the limitless capabilities of Fitbit and workout data, in general *(and how much was hidden from us)*. Excited to see what the data collected from my wearable tech could yield, I hopped onto Fitbit to export my TCX files - **until I couldn't.**

Well, I technically *could*,  but I would have to complete this process **approximately 135 times:**
![image](https://user-images.githubusercontent.com/69332964/112740528-e8717180-8f4b-11eb-9afd-5768280a7c84.png)

Click on view details. *Wait for the page to load.*

![image](https://user-images.githubusercontent.com/69332964/112740614-4d2ccc00-8f4c-11eb-9827-714471f8efaa.png)

Click to download file. *Wait another few seconds.*

Now, **repeat a couple of hundred times!** Sounds appealing, right? For some, it might be *a thousand* times before they'll be able to export their GPS tracking data.

#### The Solution
Now, you might be saying, "wait! You completely forgot something, **Google**!"  Nope. I checked that out too. Take a look [at this community forum](https://community.fitbit.com/t5/Feature-Suggestions/Exporting-Workouts-Activity-History/idi-p/1189474#) and [this one as well](https://community.fitbit.com/t5/Third-Party-Integrations/Exporting-Fitbit-data-to-Strava-anyone-succeeded/td-p/2755986) asking for a feature that SyncFit will soon provide!

![image](https://user-images.githubusercontent.com/69332964/112740754-a0534e80-8f4d-11eb-8f9b-e7cf80f5a30f.png)

It turned out that many others had run into the issue I had, *finding the current way to export data to be inefficient, and well, plain stupid.*

#### The Significance
*Fitness trackers hold a wealth of data.* The problem is, the application doesn't take full advantage of it. All the data that you track every day is lost **because there is no efficient way to export it from the application.**

By gaining back authority over your data and the ability to export it without wasting 10~ hours of your life, **athletes and everyday users can employ it to improve their performance and health.** A variety of applications exist out there, such as Strava, that can dig deep into the data from a TCX file. 

## 💻 What it does
Simply put, SyncFit exports ALL the TCX files (files with GPS, speed, and heart data) from your Fitbit account.
* Sign in to the web app with your **Fitbit account**
* SyncFit gets all the TCX files
* SyncFit allows you to download all of them **in a zip file**

## 🔨 How I built it
#### Main Tools
* AWS s3 Buckets and SDK
* Express.JS
* Heroku
* Fitbit API/Oauth2

#### What the user sees...
The frontend is **Bootstrap with HTML/CSS**, and built with the **Express** (NodeJS) framework. I used EJS to render the HTML and the user is authenticated with **Fitbit Oauth2** with the help of the `passport` module.

#### Behind the scenes...
The web app calls the **Fitbit API** two times with the `accessToken` from authentication: one to get all the activities and their TCX links, and another time to query for all the TCX file contents. It then uploads each of the TCX files to **an AWS s3 Bucket**. Once they were all uploaded, the application zips them all up and lets the user download it.

## 🥅 Challenges I ran into
#### 1. **The Fitbit API** restricts 150 requests per hour for each user account
I only had one account to test with (mine), so I had to be careful with how many times I called the API within one hour of testing.

#### 2. How do I know when the files are done uploading?
The uploading process to an s3 bucket is not the quickest thing ever, and there is no response returned from the SDK that lets me know everything was complete. I had to improvise and upload a file named `complete.txt` to indicate when upload was complete.

## 🎉 Accomplishments that I'm proud of
#### Finishing on time
At first, everything seemed **overwhelming** (especially the AWS dashboard), but I was able to complete most of my desired features on time.

#### Functionality
Surprise! **I was actually able to use the application I made for my own benefit,** and it definitely saved me a lot of time. (Remember, the other option was clicking buttons over and over again for hours).

## 📚 What I learned
#### Google. Google. Google.
I learn this from every project I complete, but **searching with the right keywords and finding the right documentation** is *crucial* to your success. Once I found the right StackOverflow post, I was good to go!

#### Express.JS, Buckets, and Oauth2
* **Express.JS** was new to me, and I was surprised by the great documentation there was available (definitely helped a ton). The **routing concepts** were an awesome introduction to future frameworks that I'll look into, and using EJS rendering was something I learned as well.
* **Buckets**, a part of AWS s3, were a way to store files in the cloud I hadn't tried before. **Serverless solutions** are great!!
* **Oauth2** is always daunting for me, and since not many developers use Fitbit Oauth, I didn't expect to do well. However, I was able to figure it out, and **now am more confident in how authentication works** - callbacks, redirects, all that nonsense.

## 📝 What's next for SyncFit
#### Fixes
* Auth still needs work
* UI could be more clear
* Need to add functionality to remove the created zip file

#### Features?
* Visualize activity data!
* Show progress of download
* Add ability to directly download AND upload to other applications

---

Bootstrap Template credits to: bootstrapmade.com
