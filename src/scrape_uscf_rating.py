# This function scrapes USCF website or FIDE for a players most up to date current rating
from bs4 import BeautifulSoup
import requests

#from urllib2 import urlopen, Request

def get_rating(name):
    r = requests.get("https://new.uschess.org/players/search/?search=" + name + "&rating_type=regular&rating_min=0&rating_max=3000",headers={'User-Agent': 'Mozilla/5.0'})
    data = r.text
    #print data
    soup = BeautifulSoup(data)
    #print soup
    for link in soup.find_all('a'):
        print(link.get('href'))

if __name__ == '__main__':
    get_rating('Eduardo Daroza')
    # url =
    # req = Request('https://new.uschess.org/players/search/?search=Daroza&rating_type=regular&rating_min=0&rating_max=3000', headers={'User-Agent': 'Mozilla/5.0'})
    # webpage = urlopen(req).read()
    # print webpage
