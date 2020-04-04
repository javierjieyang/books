#!/usr/bin/env python
# coding: utf-8

# In[1]:


import os
import bs4
import tqdm


# In[2]:


file_path  = [f"./docs/book_0/{i}" for i in os.listdir("docs/book_0") if i[-4:]=="html"]


# In[3]:


author_t = " div.fullEntry_title > h1 > small > em > small > em > a"
title_t = " div.fullEntry_title > h1"


# In[4]:


file = file_path[1]


# In[6]:


for file in tqdm.tqdm(file_path):
    with open(file,"r") as f:
        soup = bs4.BeautifulSoup(f.read())
        p = soup.select(".x_container")[0]
        author = p.select(author_t)[0].text
        title = p.select(title_t)[0].text.split("\n")[1].strip()
        soup.head.title.string = f"{title}, By {author} | {soup.head.title.string}"
        try:
            soup.find(id="footer").decompose()
        except Exception as e:
            print(f"error: fixing html {file}",e,file)

    with open(file,"w") as f:    
        f.write(str(soup))


# In[ ]:




