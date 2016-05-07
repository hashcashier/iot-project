package models;

import java.util.ArrayList;

public class User {

    public String id;
    public String password;
    public String username;
    public ArrayList<User> friends;
    public ArrayList<User> pendingIncomingRequests;
    public ArrayList<User> pendingOutgoingRequests;
    public ArrayList<LocationHistory> locationHistory;

    @Override
    public String toString(){
        return id + " " + password + " " + username + " " + locationHistory.toString();
    }
}
