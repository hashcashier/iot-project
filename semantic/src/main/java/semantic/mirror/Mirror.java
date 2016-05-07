package semantic.mirror;

import java.util.ArrayList;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import org.bson.Document;

import com.mongodb.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import models.Campus;
import models.Location;
import models.LocationHistory;
import models.User;
import models.World;

public class Mirror {

    private static World world;
    private static Lock mutex = new ReentrantLock();

    private static Campus getCampusById(ArrayList<Campus> campuses, String id){
        for(Campus campus : campuses){
            if(campus.id.equals(id))
                return campus;
        }
        return null;
    }


    private static Location getLocationById(ArrayList<Location> locations, String id){
        for(Location location : locations){
            if(location.id.equals(id))
                return location;
        }
        return null;
    }

    private static User getUserById(ArrayList<User> users, String id){
        for(User user : users){
            if(user.id.equals(id))
                return user;
        }
        return null;
    }

    public static void buildWord(){
        MongoClient client = new MongoClient();
        MongoDatabase db = client.getDatabase("friend-finder");

        System.out.println("Starting a database dump ...");
        for(String colName : db.listCollectionNames()){
            if(colName.equals("system.indexes")) continue;
            System.out.println("================== " + colName + " ======================");
            MongoCollection<Document> collection = db.getCollection(colName);
            for(Document d : collection.find()){
                System.out.println(d.toJson());
            }
        }

        // Populate the users array
        ArrayList<User> users = new ArrayList<User>();
        for(Document doc : db.getCollection("users").find()){
            User user = new User();
            user.id = doc.getObjectId("_id").toString();
            user.username = doc.getString("username").toString();
            user.password = doc.getString("password").toString();
            user.friends = new ArrayList<User>();
            user.pendingIncomingRequests = new ArrayList<User>();
            user.pendingOutgoingRequests = new ArrayList<User>();
            user.locationHistory = new ArrayList<LocationHistory>();
            users.add(user);
        }

        // Building the friendship property
        for(Document doc : db.getCollection("friendships").find()){
            User from = getUserById(users, doc.getObjectId("user").toString());
            from.friends.add(getUserById(users, doc.getObjectId("friend").toString()));
        }

        // Building friendship requests
        for(Document doc : db.getCollection("friendshiprequests").find()){
            if(!doc.getBoolean("responded").booleanValue()){
                getUserById(users, doc.getObjectId("user").toString()).pendingOutgoingRequests.add(getUserById(users, doc.getObjectId("target").toString()));
                getUserById(users, doc.getObjectId("target").toString()).pendingIncomingRequests.add(getUserById(users, doc.getObjectId("user").toString()));
            }
        }

        // Building Campuses
        ArrayList<Campus> campuses = new ArrayList<Campus>();
        for(Document doc : db.getCollection("campus").find()){
            Campus c = new Campus();
            c.id = doc.getObjectId("_id").toString();
            c.image = doc.getString("image").toString();
            c.name = doc.getString("name").toString();
            campuses.add(c);
        }

        // Building locations
        ArrayList<Location> locations = new ArrayList<Location>();
        for(Document doc : db.getCollection("locations").find()){
            Location l = new Location();
            l.id = doc.getObjectId("_id").toString();
            l._public = doc.getBoolean("public").booleanValue();
            l.campus = getCampusById(campuses, doc.getObjectId("campus").toString());
            l.name = doc.getString("name").toString();
            l.beacon = doc.getString("beacon").toString();
            locations.add(l);
        }

        // Building location history
        for(Document doc : db.getCollection("locationhistory").find()){
            LocationHistory h = new LocationHistory();
            h.location = getLocationById(locations, doc.getObjectId("location").toString());
            h.time = doc.getDate("registered");
            getUserById(users, doc.getObjectId("user").toString()).locationHistory.add(h);
        }

        World w = new World();
        w.campuses = campuses;
        w.users = users;
        w.locations = locations;

        mutex.lock();
        world =  w;
        mutex.unlock();
        client.close();
    }

    public static World getWorld(){
        mutex.lock();
        World w = world;
        mutex.unlock();
        return w;
    }
}
