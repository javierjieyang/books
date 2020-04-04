#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import os
import bs4
import tqdm
import glob
from itertools import chain


# In[ ]:


print("Formatting last updated")


# In[ ]:


files = glob.glob("docs/*.html")


# In[ ]:


for file in tqdm.tqdm(files):
    try:    
        with open(file,"r") as f:
            soup = bs4.BeautifulSoup(f.read(),features="lxml")
            p = soup.select(".dateGenerated")[0]
            p.string = f"Last updated on {p.text.strip().split('on')[1]}"
        with open(file,"w") as f:    
            f.write(str(soup))
    except Exception as e:
        print(f"error formatting last updated {file}",e)


# In[ ]:


print("Deleting footers")


# In[ ]:


#files = chain(glob.glob("docs/*/*.html"), glob.glob("docs/*.html"))
files = list(glob.glob("docs/*/*.html"))
files.extend(glob.glob("docs/*.html"))
for file in tqdm.tqdm(files):
    try:    
        with open(file,"r") as f:
            soup = bs4.BeautifulSoup(f.read(),features="lxml")
            soup.find(id="footer").decompose()
        with open(file,"w") as f:    
            f.write(str(soup))
    except Exception as e:
        if file not in  ["docs/search/search.html","docs/header.html"]:
            print(f"error deleting footer html {file}",e)


# In[ ]:


print("Fixing Titles")


# In[ ]:


file_path  = [f"./docs/book_0/{i}" for i in os.listdir("docs/book_0") if i[-4:]=="html"]


# In[ ]:


author_t = " div.fullEntry_title > h1 > small > em > small > em > a"
title_t = " div.fullEntry_title > h1"


# In[ ]:


for file in tqdm.tqdm(file_path):
    try:    
        with open(file,"r") as f:
            soup = bs4.BeautifulSoup(f.read(),features="lxml")
            p = soup.select(".x_container")[0]
            author = p.select(author_t)[0].text
            title = p.select(title_t)[0].text.split("\n")[1].strip()
            soup.head.title.string = f"{title}, By {author} | {soup.head.title.string}"
        with open(file,"w") as f:    
            f.write(str(soup))
    except Exception as e:
         print(f"error: html {file}",e,file)
        


# In[ ]:




